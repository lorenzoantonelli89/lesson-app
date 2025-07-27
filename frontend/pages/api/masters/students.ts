import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface Student {
  id: string;
  name: string;
  email: string;
  studentProfile?: {
    skillLevel?: string;
    goals: string[];
    preferredSports: string[];
  };
  appointmentsCount: number;
  appointments: any[];
  lastAppointment?: {
    date: Date;
    status: string;
  } | null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication
    const session = await getServerSession(req, res, authOptions);
    
    if (!session || !session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Check if user is a master
    if (session.user.role !== 'MASTER') {
      return res.status(403).json({ message: 'Only masters can access this endpoint' });
    }

    // Get all appointments for this master
    const appointments = await prisma.appointment.findMany({
      where: {
        masterId: session.user.id
      },
      include: {
        student: {
          include: {
            studentProfile: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Group students and calculate statistics
    const studentMap = new Map<string, Student>();

    appointments.forEach((appointment: any) => {
      const studentId = appointment.studentId;
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: appointment.student.name,
          email: appointment.student.email,
          studentProfile: appointment.student.studentProfile,
          appointmentsCount: 0,
          appointments: [],
          lastAppointment: null
        });
      }

      const student = studentMap.get(studentId)!;
      student.appointmentsCount++;
      student.appointments.push(appointment);

      // Update last appointment if this one is more recent
      if (!student.lastAppointment || appointment.date > new Date(student.lastAppointment.date)) {
        student.lastAppointment = {
          date: appointment.date,
          status: appointment.status
        };
      }
    });

    // Convert to array and sort by last appointment date
    const students = Array.from(studentMap.values()).sort((a, b) => {
      if (!a.lastAppointment && !b.lastAppointment) return 0;
      if (!a.lastAppointment) return 1;
      if (!b.lastAppointment) return -1;
      return new Date(b.lastAppointment.date).getTime() - new Date(a.lastAppointment.date).getTime();
    });

    return res.status(200).json({
      success: true,
      students: students
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 