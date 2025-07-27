import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test users
  const master1 = await prisma.user.upsert({
    where: { email: 'master1@example.com' },
    update: {},
    create: {
      email: 'master1@example.com',
      name: 'Marco Rossi',
      role: 'MASTER',
      masterProfile: {
        create: {
          bio: 'Maestro di tennis con 10 anni di esperienza',
          specialties: ['Tennis', 'Padel'],
          hourlyRate: 50,
          availability: 'Lunedì-Venerdì 9:00-18:00',
          location: 'Milano, Centro Sportivo'
        }
      }
    }
  });

  const master2 = await prisma.user.upsert({
    where: { email: 'master2@example.com' },
    update: {},
    create: {
      email: 'master2@example.com',
      name: 'Laura Bianchi',
      role: 'MASTER',
      masterProfile: {
        create: {
          bio: 'Istruttrice di nuoto certificata',
          specialties: ['Nuoto', 'Acquagym'],
          hourlyRate: 40,
          availability: 'Martedì-Sabato 8:00-20:00',
          location: 'Roma, Piscina Comunale'
        }
      }
    }
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@example.com' },
    update: {},
    create: {
      email: 'student1@example.com',
      name: 'Giuseppe Verdi',
      role: 'STUDENT',
      studentProfile: {
        create: {
          skillLevel: 'INTERMEDIATE',
          goals: ['Migliorare il servizio nel tennis'],
          preferredSports: ['Tennis'],
          medicalInfo: 'Nessuna allergia'
        }
      }
    }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@example.com' },
    update: {},
    create: {
      email: 'student2@example.com',
      name: 'Anna Neri',
      role: 'STUDENT',
      studentProfile: {
        create: {
          skillLevel: 'BEGINNER',
          goals: ['Imparare a nuotare'],
          preferredSports: ['Nuoto'],
          medicalInfo: 'Nessuna allergia'
        }
      }
    }
  });

  // Create tags
  const tag1 = await prisma.tag.upsert({
    where: { name: 'Tennis' },
    update: {},
    create: {
      name: 'Tennis',
      color: '#FF6B6B'
    }
  });

  const tag2 = await prisma.tag.upsert({
    where: { name: 'Nuoto' },
    update: {},
    create: {
      name: 'Nuoto',
      color: '#4ECDC4'
    }
  });

  const tag3 = await prisma.tag.upsert({
    where: { name: 'Principiante' },
    update: {},
    create: {
      name: 'Principiante',
      color: '#45B7D1'
    }
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log(`  - ${2} Masters`);
  console.log(`  - ${2} Students`);
  console.log(`  - ${3} Tags`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 