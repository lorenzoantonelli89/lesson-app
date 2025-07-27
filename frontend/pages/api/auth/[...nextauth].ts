import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    role?: string;
    isNewUser?: boolean;
    hasProfile?: boolean;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
      isNewUser?: boolean;
      hasProfile?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    isNewUser?: boolean;
    hasProfile?: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      // Update the newly created user with our custom fields
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isNewUser: true,
          hasProfile: false,
          role: 'TO_BE_DEFINED' // Set temporary role
        }
      });
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
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

          if (!user || !user.password) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isNewUser: user.isNewUser,
            hasProfile: user.hasProfile
          };
        } catch (error) {
          console.error('Error in credentials provider:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth
      if (account?.provider === 'google') {
        try {
          // Check if user exists and get their data
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: {
              id: true,
              role: true,
              isNewUser: true,
              hasProfile: true
            }
          });

          if (!existingUser) {
            // New user - set default values for session
            user.isNewUser = true;
            user.role = 'TO_BE_DEFINED'; // Set temporary role
            user.hasProfile = false;
          } else {
            // Existing user
            user.isNewUser = existingUser.isNewUser;
            user.role = existingUser.role || 'TO_BE_DEFINED';
            user.hasProfile = existingUser.hasProfile;
          }
        } catch (error) {
          console.error('Error in signIn callback:', error);
          // Fallback values
          user.isNewUser = true;
          user.role = 'TO_BE_DEFINED'; // Default role
          user.hasProfile = false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Leggi sempre dal database per avere dati aggiornati
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true, isNewUser: true, hasProfile: true }
          });
          
          token.role = dbUser?.role || 'TO_BE_DEFINED';
          token.isNewUser = dbUser?.isNewUser || false;
          token.hasProfile = dbUser?.hasProfile || false;
          token.id = user.id;
        } catch (error) {
          console.error('Error reading user from database in JWT callback:', error);
          // Fallback ai dati della sessione
          token.role = user.role || 'TO_BE_DEFINED';
          token.isNewUser = user.isNewUser || false;
          token.hasProfile = user.hasProfile || false;
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // Leggi sempre dal database per avere dati aggiornati
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, isNewUser: true, hasProfile: true }
          });
          
          session.user.id = token.id as string;
          session.user.role = dbUser?.role || 'TO_BE_DEFINED';
          session.user.isNewUser = dbUser?.isNewUser || false;
          session.user.hasProfile = dbUser?.hasProfile || false;
        } catch (error) {
          console.error('Error reading user from database in session callback:', error);
          // Fallback ai dati del token
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.isNewUser = token.isNewUser as boolean;
          session.user.hasProfile = token.hasProfile as boolean;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions); 