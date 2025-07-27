import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { date, masterId } = req.query;
    
    if (!date || !masterId) {
      return res.status(400).json({ 
        message: 'date and masterId are required' 
      });
    }

    // Get availability for a specific date
    const requestedDate = new Date(date as string);
    const dayOfWeek = requestedDate.getDay();
    
    // Create date range for the entire day in UTC
    const startOfDay = new Date(requestedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    // Get existing appointments for this date and master
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        masterId: masterId as string,
        date: {
          gte: startOfDay,
          lt: endOfDay
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

    // Debug: log what we found
    console.log('=== AVAILABILITY DEBUG ===');
    console.log('Date requested:', date);
    console.log('Start of day:', startOfDay.toISOString());
    console.log('End of day:', endOfDay.toISOString());
    console.log('Found appointments:', existingAppointments.map(apt => ({
      date: apt.date.toISOString(),
      localTime: apt.date.toLocaleString(),
      duration: apt.duration
    })));

    // Generate time slots from 8:00 to 20:00
    const timeSlots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        // Create slot in UTC for comparison with database
        const slotStartUTC = new Date(requestedDate);
        slotStartUTC.setUTCHours(hour, minute, 0, 0);
        
        const isBooked = existingAppointments.some(appointment => {
          const appointmentStartUTC = new Date(appointment.date);
          const appointmentEndUTC = new Date(appointmentStartUTC.getTime() + appointment.duration * 60 * 1000);
          const slotEndUTC = new Date(slotStartUTC.getTime() + 30 * 60 * 1000);
          
          return (slotStartUTC < appointmentEndUTC && slotEndUTC > appointmentStartUTC);
        });

        timeSlots.push({
          time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: !isBooked
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
  } catch (error) {
    console.error('Error fetching public availability:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 