import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role, profile } = req.body;

    if (!role || !['MASTER', 'STUDENT'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!profile) {
      return res.status(400).json({ message: 'Profile data is required' });
    }

    // Get user
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

    // Update profile based on role
    if (role === 'MASTER') {
      await prisma.masterProfile.upsert({
        where: { userId: user.id },
        update: {
          bio: profile.bio,
          specialties: Array.isArray(profile.specialties) ? profile.specialties : profile.specialties.split(',').map((s: string) => s.trim()),
          hourlyRate: profile.hourlyRate,
          availability: profile.availability,
          location: profile.location,
          phoneNumber: profile.phoneNumber
        },
        create: {
          userId: user.id,
          bio: profile.bio,
          specialties: Array.isArray(profile.specialties) ? profile.specialties : profile.specialties.split(',').map((s: string) => s.trim()),
          hourlyRate: profile.hourlyRate,
          availability: profile.availability,
          location: profile.location,
          phoneNumber: profile.phoneNumber
        }
      });
    } else {
      await prisma.studentProfile.upsert({
        where: { userId: user.id },
        update: {
          skillLevel: profile.skillLevel,
          goals: Array.isArray(profile.goals) ? profile.goals : profile.goals.split(',').map((s: string) => s.trim()),
          preferredSports: Array.isArray(profile.preferredSports) ? profile.preferredSports : profile.preferredSports.split(',').map((s: string) => s.trim()),
          medicalInfo: profile.medicalInfo
        },
        create: {
          userId: user.id,
          skillLevel: profile.skillLevel,
          goals: Array.isArray(profile.goals) ? profile.goals : profile.goals.split(',').map((s: string) => s.trim()),
          preferredSports: Array.isArray(profile.preferredSports) ? profile.preferredSports : profile.preferredSports.split(',').map((s: string) => s.trim()),
          medicalInfo: profile.medicalInfo
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 