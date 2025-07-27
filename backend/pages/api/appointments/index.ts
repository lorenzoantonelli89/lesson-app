import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  switch (req.method) {
    case 'GET':
      return getAppointments(req, res, session);
    case 'POST':
      return createAppointment(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getAppointments(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    const { role, id: userId } = session.user;
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    const where: any = {};
    
    if (role === 'MASTER') {
      where.masterId = userId;
    } else if (role === 'STUDENT') {
      where.studentId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string),
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
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
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentProfile: {
              select: {
                skillLevel: true,
              },
            },
          },
        },
        tags: true,
      },
      orderBy: {
        startTime: 'desc',
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    });

    const total = await prisma.appointment.count({ where });

    return res.status(200).json({
      appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function createAppointment(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    const { role, id: userId } = session.user;
    const {
      masterId,
      studentId,
      startTime,
      endTime,
      duration,
      location,
      isOnline,
      meetingLink,
      price,
      currency,
      notes,
    } = req.body;

    // Validate that the user can create this appointment
    if (role === 'STUDENT' && studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (role === 'MASTER' && masterId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const appointment = await prisma.appointment.create({
      data: {
        masterId,
        studentId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        location,
        isOnline,
        meetingLink,
        price,
        currency,
        notes,
      },
      include: {
        master: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json(appointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 