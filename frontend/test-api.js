const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAppointmentFlow() {
  try {
    console.log('=== TESTING APPOINTMENT FLOW ===\n');

    // First, get existing users
    console.log('0. Getting existing users...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    console.log('✅ Available users:');
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
    });
    console.log('');

    // Find a valid student ID
    const student = users.find(u => u.role === 'STUDENT');
    const master = users.find(u => u.role === 'MASTER');

    if (!student || !master) {
      console.log('❌ Need both a student and master user for testing');
      return;
    }

    // 1. Create a test appointment
    console.log('1. Creating test appointment...');
    const testAppointment = await prisma.appointment.create({
      data: {
        masterId: master.id,
        studentId: student.id,
        date: new Date(2025, 6, 31, 15, 0, 0, 0), // 15:00 on 2025-07-31
        duration: 60,
        price: 50,
        notes: 'Test appointment',
        status: 'PENDING'
      }
    });

    console.log('✅ Appointment created:');
    console.log(`   ID: ${testAppointment.id}`);
    console.log(`   Date (ISO): ${testAppointment.date.toISOString()}`);
    console.log(`   Date (Local): ${testAppointment.date.toLocaleString()}`);
    console.log(`   Duration: ${testAppointment.duration} minutes`);
    console.log(`   Status: ${testAppointment.status}\n`);

    // 2. Test master calendar - get appointments for master
    console.log('2. Testing master calendar...');
    const masterAppointments = await prisma.appointment.findMany({
      where: {
        masterId: master.id,
        date: {
          gte: new Date(2025, 6, 31, 0, 0, 0, 0),
          lt: new Date(2025, 6, 31, 23, 59, 59, 999)
        }
      },
      orderBy: { date: 'asc' }
    });

    console.log('✅ Master calendar appointments:');
    masterAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt.date.toLocaleString()} (${apt.duration} min) - ${apt.status}`);
    });
    console.log('');

    // 3. Test student availability - check availability for 2025-07-31
    console.log('3. Testing student availability...');
    const requestedDate = new Date('2025-07-31');
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        masterId: master.id,
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

    console.log('✅ Existing appointments for availability check:');
    existingAppointments.forEach((apt, index) => {
      console.log(`   ${index + 1}. ${apt.date.toLocaleString()} (${apt.duration} min)`);
    });
    console.log('');

    // 4. Test time slot conflicts
    console.log('4. Testing time slot conflicts...');
    const testSlots = ['14:00', '14:30', '15:00', '15:30', '16:00'];
    
    testSlots.forEach(time => {
      const [hour, minute] = time.split(':').map(Number);
      const slotStart = new Date(2025, 6, 31, hour, minute, 0, 0);
      const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000);
      
      const isBooked = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60 * 1000);
        return (slotStart < appointmentEnd && slotEnd > appointmentStart);
      });

      console.log(`   ${time}: ${isBooked ? '❌ BOOKED' : '✅ AVAILABLE'}`);
    });

    // 5. Clean up - delete test appointment
    console.log('\n5. Cleaning up...');
    await prisma.appointment.delete({
      where: { id: testAppointment.id }
    });
    console.log('✅ Test appointment deleted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAppointmentFlow(); 