import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { signIn } from 'next-auth/react';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email e password sono obbligatori' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isNewUser: true,
        hasProfile: true
      }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'Credenziali non valide' 
      });
    }

    // Check if user has password (not OAuth only)
    if (!user.password) {
      return res.status(400).json({ 
        message: 'Questo account è stato creato con Google. Usa "Accedi con Google"' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(400).json({ 
        message: 'Credenziali non valide' 
      });
    }

    // Return success with redirect info
    return res.status(200).json({
      success: true,
      message: 'Login effettuato con successo',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isNewUser: user.isNewUser,
        hasProfile: user.hasProfile
      },
      redirectTo: user.isNewUser ? '/auth/select-role' : 
                  !user.hasProfile ? `/auth/complete-profile?role=${user.role}` :
                  `/dashboard/${user.role.toLowerCase()}`
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ 
      message: 'Errore interno del server' 
    });
  }
} 