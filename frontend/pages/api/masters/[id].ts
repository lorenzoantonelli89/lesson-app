import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.query;
  const masterId = Array.isArray(id) ? id[0] : id;

  if (!masterId) {
    return res.status(400).json({ message: 'Master ID is required' });
  }

  try {
    const master = await prisma.user.findUnique({
      where: { id: masterId },
      include: {
        masterProfile: {
          select: {
            bio: true,
            specialties: true,
            hourlyRate: true,
            location: true,
            phoneNumber: true,
            availability: true
          }
        }
      }
    });

    if (!master || master.role !== 'MASTER') {
      return res.status(404).json({ message: 'Master not found' });
    }

    // Add placeholder rating data
    const masterWithRating = {
      ...master,
      averageRating: 4.5, // Placeholder - will be calculated from reviews
      totalReviews: 12, // Placeholder
      isAvailable: true // Placeholder - will check availability
    };

    return res.status(200).json({
      success: true,
      master: masterWithRating
    });
  } catch (error) {
    console.error('Error fetching master:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 