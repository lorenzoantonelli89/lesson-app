import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('🔍 update-role: Starting role update process');
    
    const session = await getServerSession(req, res, authOptions);
    console.log('🔍 update-role: Session user email:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('❌ update-role: No session or email found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { role } = req.body;
    console.log('🔍 update-role: Requested role:', role);

    if (!role || !['MASTER', 'STUDENT'].includes(role)) {
      console.log('❌ update-role: Invalid role:', role);
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isNewUser: true,
        hasProfile: true
      }
    });
    
    console.log('🔍 update-role: Current user data:', currentUser);

    if (!currentUser) {
      console.log('❌ update-role: User not found in database');
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isNewUser: true,
        hasProfile: true
      }
    });

    console.log('✅ update-role: User updated successfully:', updatedUser);

    return res.status(200).json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 