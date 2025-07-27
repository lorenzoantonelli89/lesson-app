import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sport, location, priceMin, priceMax, rating } = req.query;

    // Build where clause - simplified
    const whereClause: any = {
      role: 'MASTER',
      masterProfile: {
        isNot: null
      }
    };

    // Filter by sport (specialties) - temporarily disabled due to Prisma array issue
    // if (sport) {
    //   whereClause.masterProfile = {
    //     ...whereClause.masterProfile,
    //     specialties: {
    //       has: sport as string
    //     }
    //   };
    // }

    // Filter by location - temporarily disabled
    // if (location) {
    //   whereClause.masterProfile = {
    //     ...whereClause.masterProfile,
    //     location: {
    //       contains: location as string
    //     }
    //   };
    // }

    // Filter by price range - temporarily disabled
    // if (priceMin || priceMax) {
    //   whereClause.masterProfile = {
    //     ...whereClause.masterProfile,
    //     hourlyRate: {}
    //   };

    //   if (priceMin) {
    //     whereClause.masterProfile.hourlyRate.gte = parseInt(priceMin as string);
    //   }

    //   if (priceMax) {
    //     whereClause.masterProfile.hourlyRate.lte = parseInt(priceMax as string);
    //   }
    // }

    console.log('=== SEARCH DEBUG ===');
    console.log('Where clause:', JSON.stringify(whereClause, null, 2));

    const masters = await prisma.user.findMany({
      where: whereClause,
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Calculate average rating for each master (placeholder for now)
    const mastersWithRating = masters.map(master => ({
      ...master,
      averageRating: 4.5, // Placeholder - will be calculated from reviews
      totalReviews: 12, // Placeholder
      isAvailable: true // Placeholder - will check availability
    }));

    return res.status(200).json({
      success: true,
      masters: mastersWithRating
    });
  } catch (error) {
    console.error('Error searching masters:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 