import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.email) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.method === 'GET') {
    try {
      // Get appointments based on user role
      let appointments;
      
      if (user.role === 'MASTER') {
        appointments = await prisma.appointment.findMany({
          where: { masterId: user.id },
          include: {
            student: {
              select: {
                id: true,
                name: true,
                email: true,
                studentProfile: {
                  select: {
                    skillLevel: true,
                    preferredSports: true
                  }
                }
              }
            }
          },
          orderBy: { date: 'asc' }
        });
      } else if (user.role === 'STUDENT') {
        appointments = await prisma.appointment.findMany({
          where: { studentId: user.id },
          include: {
            master: {
              select: {
                id: true,
                name: true,
                email: true,
                masterProfile: {
                  select: {
                    specialties: true,
                    hourlyRate: true,
                    location: true
                  }
                }
              }
            }
          },
          orderBy: { date: 'asc' }
        });
      } else {
        return res.status(403).json({ message: 'Invalid user role' });
      }

      return res.status(200).json({
        success: true,
        appointments: appointments
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { masterId, date, time, duration, notes, price } = req.body;

      // Validate required fields
      if (!masterId || !date || !time || !duration) {
        return res.status(400).json({ 
          message: 'masterId, date, time, and duration are required' 
        });
      }

      // Check if user is a student
      if (user.role !== 'STUDENT') {
        return res.status(403).json({ 
          message: 'Only students can create appointments' 
        });
      }

      // Check if master exists
      const master = await prisma.user.findUnique({
        where: { id: masterId },
        include: { masterProfile: true }
      });

      if (!master || master.role !== 'MASTER') {
        return res.status(404).json({ message: 'Master not found' });
      }

      // Create appointment date in UTC
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      
      // Create date in local timezone first
      const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);
      
      // Convert to UTC by adding timezone offset
      const appointmentDate = new Date(localDate.getTime() + (localDate.getTimezoneOffset() * 60000));

      // Debug log
      console.log('=== APPOINTMENT CREATION DEBUG ===');
      console.log('Input date:', date);
      console.log('Input time:', time);
      console.log('Local date:', localDate.toLocaleString());
      console.log('Local ISO:', localDate.toISOString());
      console.log('UTC date to save:', appointmentDate.toISOString());
      console.log('Timezone offset:', localDate.getTimezoneOffset(), 'minutes');
      console.log('Expected behavior:');
      console.log('  - User selects:', time, 'local time');
      console.log('  - Should save as:', new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000)).toISOString());
      console.log('  - Should display as:', time, 'local time everywhere');

      // Check for time conflicts - use UTC consistently
      const requestDate = appointmentDate;
      const appointmentEndTime = new Date(requestDate.getTime() + duration * 60 * 1000);
      
      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          masterId: masterId,
          date: {
            gte: requestDate,
            lt: appointmentEndTime
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      // Also check for overlapping appointments that start before but end after our start time
      const overlappingAppointment = await prisma.appointment.findFirst({
        where: {
          masterId: masterId,
          date: {
            lt: requestDate
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        }
      });

      // If there's an overlapping appointment, check if it ends after our start time
      if (overlappingAppointment) {
        const overlappingEndTime = new Date(overlappingAppointment.date.getTime() + overlappingAppointment.duration * 60 * 1000);
        if (overlappingEndTime > requestDate) {
          return res.status(409).json({ 
            message: 'Time slot overlaps with existing appointment' 
          });
        }
      }

      if (conflictingAppointment) {
        return res.status(409).json({ 
          message: 'Time slot is not available' 
        });
      }

      // Create appointment - save in local timezone
      const appointment = await prisma.appointment.create({
        data: {
          masterId: masterId,
          studentId: user.id,
          date: appointmentDate, // Save in local timezone
          duration: duration,
          price: price || master.masterProfile?.hourlyRate || 0,
          notes: notes || '',
          status: 'PENDING'
        },
        include: {
          master: {
            select: {
              id: true,
              name: true,
              email: true,
              masterProfile: {
                select: {
                  location: true
                }
              }
            }
          },
          student: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      // Send notification to master about new appointment
      try {
        const { notificationService } = await import('../../../services/notificationService');
        await notificationService.sendNewAppointment({
          recipient: {
            email: appointment.master.email,
            name: appointment.master.name
          },
          appointment: {
            id: appointment.id,
            date: appointment.date.toISOString(),
            duration: appointment.duration,
            masterName: appointment.master.name,
            studentName: appointment.student.name,
            location: appointment.master.masterProfile?.location || 'Da definire',
            price: appointment.price
          }
        });
      } catch (error) {
        console.error('Error sending notification:', error);
        // Don't fail the appointment creation if notification fails
      }

      return res.status(201).json({
        success: true,
        appointment: appointment
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 