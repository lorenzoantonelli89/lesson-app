const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugAppointments() {
  console.log('🔍 DEBUG APPOINTMENTS IN DATABASE\n');

  try {
    // Get all appointments
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
        date: 'asc'
      }
    });

    console.log(`Found ${appointments.length} appointments:\n`);

    appointments.forEach((appointment, index) => {
      console.log(`=== APPOINTMENT ${index + 1} ===`);
      console.log(`ID: ${appointment.id}`);
      console.log(`Master: ${appointment.master.name} (${appointment.master.email})`);
      console.log(`Student: ${appointment.student.name} (${appointment.student.email})`);
      console.log(`Date (ISO): ${appointment.date.toISOString()}`);
      console.log(`Date (Local): ${appointment.date.toLocaleString()}`);
      console.log(`Date (UTC): ${appointment.date.toUTCString()}`);
      console.log(`Duration: ${appointment.duration} minutes`);
      console.log(`Status: ${appointment.status}`);
      console.log(`Price: ${appointment.price}`);
      console.log(`Notes: ${appointment.notes}`);
      console.log('');
    });

    // Test timezone conversion
    console.log('=== TIMEZONE CONVERSION TEST ===');
    if (appointments.length > 0) {
      const testAppointment = appointments[0];
      console.log(`Original date: ${testAppointment.date.toISOString()}`);
      console.log(`Local time: ${testAppointment.date.toLocaleString()}`);
      console.log(`UTC time: ${testAppointment.date.toUTCString()}`);
      console.log(`Timezone offset: ${testAppointment.date.getTimezoneOffset()} minutes`);
      
      // Test what happens when we create a new Date from the ISO string
      const newDate = new Date(testAppointment.date.toISOString());
      console.log(`New Date from ISO: ${newDate.toLocaleString()}`);
      console.log(`New Date UTC: ${newDate.toUTCString()}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAppointments(); 