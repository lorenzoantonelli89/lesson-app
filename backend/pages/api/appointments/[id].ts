import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/prisma';
import { AutomationService } from '../../../services/automationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  switch (req.method) {
    case 'GET':
      return getAppointment(req, res, session, id as string);
    case 'PUT':
      return updateAppointment(req, res, session, id as string);
    case 'DELETE':
      return cancelAppointment(req, res, session, id as string);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getAppointment(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any,
  appointmentId: string
) {
  try {
    const { role, id: userId } = session.user;

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
                preferredSports: true,
              },
            },
          },
        },
        tags: true,
        automation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (role === 'MASTER' && appointment.masterId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (role === 'STUDENT' && appointment.studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateAppointment(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any,
  appointmentId: string
) {
  try {
    const { role, id: userId } = session.user;
    const updateData = req.body;

    // Get the appointment to check permissions
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!existingAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    if (role === 'MASTER' && existingAppointment.masterId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (role === 'STUDENT' && existingAppointment.studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        ...updateData,
        startTime: updateData.startTime ? new Date(updateData.startTime) : undefined,
        endTime: updateData.endTime ? new Date(updateData.endTime) : undefined,
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

    return res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function cancelAppointment(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any,
  appointmentId: string
) {
  try {
    const { role, id: userId } = session.user;
    const { reason } = req.body;

    // Get the appointment to check permissions
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Check permissions
    if (role === 'MASTER' && appointment.masterId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (role === 'STUDENT' && appointment.studentId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Handle cancellation with automation
    const result = await AutomationService.handleCancellation(
      appointmentId,
      userId,
      reason
    );

    return res.status(200).json({
      message: 'Appointment cancelled successfully',
      potentialReplacements: result.potentialReplacements,
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 