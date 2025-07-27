const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAppointments() {
  try {
    console.log('=== DEBUG APPOINTMENTS ===');
    
    const appointments = await prisma.appointment.findMany({
      include: {
        master: {
          select: {
            name: true,
            email: true
          }
        },
        student: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`Found ${appointments.length} appointments:`);
    
    appointments.forEach((apt, index) => {
      console.log(`\n${index + 1}. Appointment ID: ${apt.id}`);
      console.log(`   Master: ${apt.master.name} (${apt.master.email})`);
      console.log(`   Student: ${apt.student.name} (${apt.student.email})`);
      console.log(`   Date (ISO): ${apt.date.toISOString()}`);
      console.log(`   Date (Local): ${apt.date.toLocaleString()}`);
      console.log(`   Duration: ${apt.duration} minutes`);
      console.log(`   Status: ${apt.status}`);
      console.log(`   Price: ${apt.price}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAppointments(); 