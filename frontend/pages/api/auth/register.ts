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
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ 
        message: 'Tutti i campi sono obbligatori' 
      });
    }

    if (!['MASTER', 'STUDENT'].includes(role)) {
      return res.status(400).json({ 
        message: 'Ruolo non valido' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'La password deve essere di almeno 6 caratteri' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Un utente con questa email esiste già' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        isNewUser: false, // Ruolo già scelto
        hasProfile: role === 'MASTER' && req.body.profile ? true : false
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isNewUser: true,
        hasProfile: true
      }
    });

    // Se è un maestro e sono forniti i dati del profilo, crea il profilo
    if (role === 'MASTER' && req.body.profile) {
      try {
        await prisma.masterProfile.create({
          data: {
            userId: user.id,
            bio: req.body.profile.bio || '',
            specialties: Array.isArray(req.body.profile.specialties) ? req.body.profile.specialties : 
                       (req.body.profile.specialties ? req.body.profile.specialties.split(',').map(s => s.trim()) : []),
            hourlyRate: req.body.profile.hourlyRate ? parseFloat(req.body.profile.hourlyRate) : 0,
            availability: req.body.profile.availability || '',
            location: req.body.profile.location || '',
            phoneNumber: req.body.profile.phoneNumber || ''
          }
        });
        
        // Update user hasProfile
        await prisma.user.update({
          where: { id: user.id },
          data: { hasProfile: true }
        });
      } catch (profileError) {
        console.error('Error creating master profile:', profileError);
        // Delete the user if profile creation fails
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(500).json({ 
          message: 'Errore nella creazione del profilo maestro' 
        });
      }
    }

    // Return success with redirect info
    return res.status(201).json({
      success: true,
      message: 'Utente registrato con successo',
      user,
      redirectTo: '/auth/select-role'
    });

  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ 
      message: 'Errore interno del server' 
    });
  }
} 