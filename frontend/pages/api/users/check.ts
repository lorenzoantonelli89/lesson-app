import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const email = Array.isArray(req.query.email) ? req.query.email[0] : req.query.email;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        masterProfile: true,
        studentProfile: true
      }
    });

    if (user) {
      // User exists - check if profile is complete
      const hasProfile = user.role === 'MASTER' ? user.masterProfile : user.studentProfile;
      
      return res.status(200).json({
        exists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          hasProfile: !!hasProfile
        }
      });
    } else {
      // User doesn't exist
      return res.status(200).json({
        exists: false,
        user: null
      });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 