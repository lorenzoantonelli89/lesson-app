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
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user with profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        masterProfile: true,
        studentProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return profile based on role
    let profile = null;
    if (user.role === 'MASTER' && user.masterProfile) {
      profile = user.masterProfile;
    } else if (user.role === 'STUDENT' && user.studentProfile) {
      profile = user.studentProfile;
    }

    return res.status(200).json({
      success: true,
      profile: profile
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 