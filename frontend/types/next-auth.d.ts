import NextAuth from "next-auth";

// Estendi i tipi NextAuth per includere 'role' in session.user

declare module "next-auth" {
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