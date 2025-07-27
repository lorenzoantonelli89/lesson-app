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

  const { id } = req.query;
  const appointmentId = Array.isArray(id) ? id[0] : id;

  if (!appointmentId) {
    return res.status(400).json({ message: 'Appointment ID is required' });
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
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
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
                  location: true,
                  phoneNumber: true
                }
              }
            }
          },
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
        }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if user has access to this appointment
      if (appointment.masterId !== user.id && appointment.studentId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      return res.status(200).json({
        success: true,
        appointment: appointment
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if user has access to modify this appointment
      if (appointment.masterId !== user.id && appointment.studentId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const { status, notes, date, duration } = req.body;

      // Only allow status changes for now
      const updateData: any = {};
      
      if (status && ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
        updateData.status = status;
      }
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }

      if (date && duration) {
        // Check for time conflicts if date is being changed
        const conflictingAppointment = await prisma.appointment.findFirst({
          where: {
            masterId: appointment.masterId,
            date: {
              gte: new Date(date),
              lt: new Date(new Date(date).getTime() + duration * 60 * 1000)
            },
            status: {
              in: ['PENDING', 'CONFIRMED']
            },
            id: { not: appointmentId }
          }
        });

        if (conflictingAppointment) {
          return res.status(409).json({ 
            message: 'Time slot is not available' 
          });
        }

        updateData.date = new Date(date);
        updateData.duration = duration;
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: updateData,
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

      // Send notifications based on status change
      if (status && status !== appointment.status) {
        try {
          const { notificationService } = await import('../../../services/notificationService');
          
          if (status === 'CONFIRMED') {
            // Notify student that appointment is confirmed
            await notificationService.sendAppointmentConfirmed({
              recipient: {
                email: updatedAppointment.student.email,
                name: updatedAppointment.student.name
              },
              appointment: {
                id: updatedAppointment.id,
                date: updatedAppointment.startTime.toISOString(),
                duration: updatedAppointment.duration,
                masterName: updatedAppointment.master.name,
                studentName: updatedAppointment.student.name,
                location: (updatedAppointment.master.masterProfile?.location as string) || 'Da definire',
                price: updatedAppointment.price || 0
              }
            });
          } else if (status === 'CANCELLED') {
            // Notify both parties about cancellation
            await notificationService.sendAppointmentCancelled({
              recipient: {
                email: updatedAppointment.student.email,
                name: updatedAppointment.student.name
              },
              appointment: {
                id: updatedAppointment.id,
                date: updatedAppointment.startTime.toISOString(),
                duration: updatedAppointment.duration,
                masterName: updatedAppointment.master.name,
                studentName: updatedAppointment.student.name,
                location: (updatedAppointment.master.masterProfile?.location as string) || 'Da definire',
                price: updatedAppointment.price || 0
              }
            });
          }
        } catch (error) {
          console.error('Error sending notification:', error);
          // Don't fail the update if notification fails
        }
      }

      return res.status(200).json({
        success: true,
        appointment: updatedAppointment
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      // Check if user has access to delete this appointment
      if (appointment.masterId !== user.id && appointment.studentId !== user.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Only allow cancellation, not deletion
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'CANCELLED' }
      });

      return res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 