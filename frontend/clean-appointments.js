const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanAppointments() {
  try {
    console.log('=== CLEANING APPOINTMENTS FOR MASTER cmdkhqun7000356o4stepja8b ===\n');

    // Count appointments before deletion
    const countBefore = await prisma.appointment.count({
      where: {
        masterId: 'cmdkhqun7000356o4stepja8b'
      }
    });

    console.log(`📊 Found ${countBefore} appointments to delete`);

    if (countBefore > 0) {
      // Delete all appointments for this master
      const deletedAppointments = await prisma.appointment.deleteMany({
        where: {
          masterId: 'cmdkhqun7000356o4stepja8b'
        }
      });

      console.log(`✅ Deleted ${deletedAppointments.count} appointments`);
    } else {
      console.log('ℹ️  No appointments found for this master');
    }

    // Verify deletion
    const countAfter = await prisma.appointment.count({
      where: {
        masterId: 'cmdkhqun7000356o4stepja8b'
      }
    });

    console.log(`📊 Remaining appointments: ${countAfter}`);
    console.log('✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanAppointments(); 