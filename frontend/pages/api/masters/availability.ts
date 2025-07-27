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

  if (user.role !== 'MASTER') {
    return res.status(403).json({ message: 'Only masters can manage availability' });
  }

  if (req.method === 'GET') {
    try {
      const { date, masterId } = req.query;
      
      if (date && masterId) {
        // Get availability for a specific date
        const requestedDate = new Date(date as string);
        const dayOfWeek = requestedDate.getDay();
        
        // Get existing appointments for this date and master
        const existingAppointments = await prisma.appointment.findMany({
          where: {
            masterId: masterId as string,
            date: {
              gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
              lt: new Date(requestedDate.setHours(23, 59, 59, 999))
            },
            status: {
              in: ['PENDING', 'CONFIRMED']
            }
          },
          select: {
            date: true,
            duration: true
          }
        });

        // Generate time slots from 8:00 to 20:00
        const timeSlots = [];
        for (let hour = 8; hour < 20; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            const slotStart = new Date(requestedDate);
            slotStart.setHours(hour, minute, 0, 0);
            
            // Check if this slot conflicts with existing appointments
            const isBooked = existingAppointments.some(appointment => {
              const appointmentStart = new Date(appointment.date);
              const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60 * 1000);
              const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 min slots
              
              return (slotStart < appointmentEnd && slotEnd > appointmentStart);
            });

            // For demo purposes, make slots available on weekdays
            const isAvailable = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
            
            timeSlots.push({
              time,
              available: isAvailable && !isBooked,
              booked: isBooked
            });
          }
        }

        return res.status(200).json({
          success: true,
          availability: {
            date: date,
            masterId: masterId,
            timeSlots: timeSlots
          }
        });
      }

      // Return general availability structure
      const masterProfile = await prisma.masterProfile.findUnique({
        where: { userId: user.id }
      });

      let availability;
      if (masterProfile?.availability) {
        try {
          const savedData = JSON.parse(masterProfile.availability);
          availability = {
            id: 'availability-1',
            masterId: user.id,
            timeSlots: savedData.timeSlots || [],
            notes: savedData.notes || ''
          };
        } catch (error) {
          console.error('Error parsing saved availability:', error);
          // Fallback to default structure
          availability = {
            id: 'availability-1',
            masterId: user.id,
            timeSlots: [
              { id: 'slot-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
              { id: 'slot-2', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
              { id: 'slot-3', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
              { id: 'slot-4', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
              { id: 'slot-5', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
              { id: 'slot-6', dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: false },
              { id: 'slot-0', dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: false }
            ],
            notes: 'Disponibile dal lunedì al venerdì, 9:00-18:00'
          };
        }
      } else {
        // Default structure if no saved availability
        availability = {
          id: 'availability-1',
          masterId: user.id,
          timeSlots: [
            { id: 'slot-1', dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true },
            { id: 'slot-2', dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true },
            { id: 'slot-3', dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true },
            { id: 'slot-4', dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true },
            { id: 'slot-5', dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true },
            { id: 'slot-6', dayOfWeek: 6, startTime: '09:00', endTime: '18:00', isActive: false },
            { id: 'slot-0', dayOfWeek: 0, startTime: '09:00', endTime: '18:00', isActive: false }
          ],
          notes: 'Disponibile dal lunedì al venerdì, 9:00-18:00'
        };
      }

      return res.status(200).json({
        success: true,
        availability: availability
      });
    } catch (error) {
      console.error('Error fetching availability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Extract data from the availability object
      const { timeSlots, notes } = req.body;

      // Debug: log what we received
      console.log('=== API AVAILABILITY DEBUG ===');
      console.log('Received body:', JSON.stringify(req.body, null, 2));
      console.log('timeSlots:', timeSlots);
      console.log('timeSlots type:', typeof timeSlots);
      console.log('timeSlots is array:', Array.isArray(timeSlots));

      // Validate timeSlots
      if (!timeSlots || !Array.isArray(timeSlots)) {
        console.log('❌ timeSlots validation failed');
        return res.status(400).json({ 
          message: 'timeSlots is required and must be an array' 
        });
      }

      // Validate each time slot
      for (const slot of timeSlots) {
        console.log('Validating slot:', slot);
        console.log('slot.dayOfWeek:', slot.dayOfWeek, 'type:', typeof slot.dayOfWeek);
        
        if (slot.dayOfWeek === undefined || slot.dayOfWeek === null || typeof slot.dayOfWeek !== 'number' || slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
          console.log('❌ dayOfWeek validation failed for slot:', slot);
          return res.status(400).json({ 
            message: 'Each time slot must have a valid dayOfWeek (0-6)' 
          });
        }

        if (slot.isActive) {
          if (!slot.startTime || !slot.endTime) {
            console.log('❌ startTime/endTime validation failed for slot:', slot);
            return res.status(400).json({ 
              message: 'Active time slots must have startTime and endTime' 
            });
          }

          // Validate time format (HH:MM)
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
            console.log('❌ time format validation failed for slot:', slot);
            return res.status(400).json({ 
              message: 'Time format must be HH:MM' 
            });
          }

          // Validate that end time is after start time
          const startMinutes = parseInt(slot.startTime.split(':')[0]) * 60 + parseInt(slot.startTime.split(':')[1]);
          const endMinutes = parseInt(slot.endTime.split(':')[0]) * 60 + parseInt(slot.endTime.split(':')[1]);
          
          if (endMinutes <= startMinutes) {
            console.log('❌ end time validation failed for slot:', slot);
            return res.status(400).json({ 
              message: 'End time must be after start time' 
            });
          }
        }
      }

      console.log('✅ All validations passed');

      // Save availability to database
      const availabilityData = {
        timeSlots: timeSlots,
        notes: notes || ''
      };

      // Update or create master profile with availability
      const updatedProfile = await prisma.masterProfile.upsert({
        where: {
          userId: user.id
        },
        update: {
          availability: JSON.stringify(availabilityData)
        },
        create: {
          userId: user.id,
          bio: '',
          specialties: [],
          hourlyRate: 0,
          availability: JSON.stringify(availabilityData),
          location: '',
          phoneNumber: ''
        }
      });

      console.log('✅ Availability saved to database');

      const savedAvailability = {
        id: 'availability-1',
        masterId: user.id,
        timeSlots: timeSlots,
        notes: notes || ''
      };

      return res.status(200).json({
        success: true,
        availability: savedAvailability,
        message: 'Availability saved successfully'
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 