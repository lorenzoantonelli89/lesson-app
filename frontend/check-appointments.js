const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAppointments() {
  try {
    console.log('=== CHECKING APPOINTMENTS FOR MASTER cmdkhqun7000356o4stepja8b ===\n');

    // Get all appointments for this master
    const appointments = await prisma.appointment.findMany({
      where: {
        masterId: 'cmdkhqun7000356o4stepja8b'
      },
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
        date: 'asc'
      }
    });

    if (appointments.length === 0) {
      console.log('ℹ️  No appointments found for this master');
      return;
    }

    console.log(`📊 Found ${appointments.length} appointments:\n`);

    appointments.forEach((appointment, index) => {
      console.log(`${index + 1}. Appointment ID: ${appointment.id}`);
      console.log(`   Master: ${appointment.master.name} (${appointment.master.email})`);
      console.log(`   Student: ${appointment.student.name} (${appointment.student.email})`);
      console.log(`   Date (ISO): ${appointment.date.toISOString()}`);
      console.log(`   Date (Local): ${appointment.date.toLocaleString()}`);
      console.log(`   Duration: ${appointment.duration} minutes`);
      console.log(`   Status: ${appointment.status}`);
      console.log(`   Price: ${appointment.price}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAppointments(); 