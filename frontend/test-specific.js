const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSpecificDate() {
  try {
    console.log('=== TESTING SPECIFIC DATE (2025-07-28) ===\n');

    // Get the specific appointment
    const appointment = await prisma.appointment.findFirst({
      where: {
        date: {
          gte: new Date('2025-07-28T00:00:00.000Z'),
          lt: new Date('2025-07-28T23:59:59.999Z')
        },
        masterId: 'cmdkhqun7000356o4stepja8b'
      }
    });

    if (appointment) {
      console.log('✅ Found appointment:');
      console.log(`   ID: ${appointment.id}`);
      console.log(`   Date (ISO): ${appointment.date.toISOString()}`);
      console.log(`   Date (Local): ${appointment.date.toLocaleString()}`);
      console.log(`   Duration: ${appointment.duration} minutes`);
      console.log(`   Status: ${appointment.status}\n`);
    }

    // Test availability check for 2025-07-28
    console.log('Testing availability check...');
    const requestedDate = new Date('2025-07-28');
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        masterId: 'cmdkhqun7000356o4stepja8b',
        date: {
          gte: startOfDay,
          lt: endOfDay
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      select: {
        date: true,
        duration: true
      }
    });

    console.log('✅ Appointments found for availability:');
    existingAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt.date.toLocaleString()} (${apt.duration} min)`);
    });
    console.log('');

    // Test time slot conflicts around 10:00
    console.log('Testing time slot conflicts around 10:00...');
    const testSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
    
    testSlots.forEach(time => {
      const [hour, minute] = time.split(':').map(Number);
      const slotStart = new Date(2025, 6, 28, hour, minute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
      
      const isBooked = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60 * 1000);
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      console.log(`   ${time}: ${isBooked ? '❌ BOOKED' : '✅ AVAILABLE'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSpecificDate(); 