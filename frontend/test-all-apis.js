const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Test data
const testData = {
  master: {
    name: 'Test Master',
    email: 'master@test.com',
    password: 'password123',
    role: 'MASTER',
    profile: {
      bio: 'Test bio',
      specialties: ['Calcio', 'Tennis'],
      hourlyRate: 50,
      location: 'Milano',
      phoneNumber: '123456789'
    }
  },
  student: {
    name: 'Test Student',
    email: 'student@test.com',
    password: 'password123',
    role: 'STUDENT',
    profile: {
      skillLevel: 'Intermedio',
      goals: ['Migliorare tecnica'],
      preferredSports: ['Calcio'],
      medicalInfo: 'Nessuna'
    }
  }
};

async function testAllAPIs() {
  console.log('🚀 STARTING COMPREHENSIVE API TEST\n');

  let masterId, studentId, masterToken, studentToken;
  let testAppointmentId;

  try {
    // ===== 1. TEST REGISTRATION =====
    console.log('📝 1. TESTING REGISTRATION APIs');
    console.log('='.repeat(50));

    // Test manual registration
    console.log('\n1.1 Testing manual registration...');
    const masterResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testData.master.name,
        email: testData.master.email,
        password: testData.master.password,
        role: testData.master.role,
        profile: testData.master.profile
      })
    });

    if (masterResponse.ok) {
      const masterData = await masterResponse.json();
      console.log('✅ Master registration successful:', masterData.user.id);
      masterId = masterData.user.id;
    } else {
      const error = await masterResponse.text();
      console.log('❌ Master registration failed:', error);
    }

    // Test student registration
    const studentResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: testData.student.name,
        email: testData.student.email,
        password: testData.student.password,
        role: testData.student.role,
        profile: testData.student.profile
      })
    });

    if (studentResponse.ok) {
      const studentData = await studentResponse.json();
      console.log('✅ Student registration successful:', studentData.user.id);
      studentId = studentData.user.id;
    } else {
      const error = await studentResponse.text();
      console.log('❌ Student registration failed:', error);
    }

    // ===== 2. TEST LOGIN =====
    console.log('\n📝 2. TESTING LOGIN APIs');
    console.log('='.repeat(50));

    // Test master login
    console.log('\n2.1 Testing master login...');
    const masterLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testData.master.email,
        password: testData.master.password
      })
    });

    if (masterLoginResponse.ok) {
      const masterLoginData = await masterLoginResponse.json();
      console.log('✅ Master login successful');
      masterToken = masterLoginData.token; // If token is returned
    } else {
      const error = await masterLoginResponse.text();
      console.log('❌ Master login failed:', error);
    }

    // Test student login
    const studentLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testData.student.email,
        password: testData.student.password
      })
    });

    if (studentLoginResponse.ok) {
      const studentLoginData = await studentLoginResponse.json();
      console.log('✅ Student login successful');
      studentToken = studentLoginData.token; // If token is returned
    } else {
      const error = await studentLoginResponse.text();
      console.log('❌ Student login failed:', error);
    }

    // ===== 3. TEST PROFILE APIs =====
    console.log('\n📝 3. TESTING PROFILE APIs');
    console.log('='.repeat(50));

    // Test get profile
    console.log('\n3.1 Testing get profile...');
    const profileResponse = await fetch(`http://localhost:3000/api/users/profile`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Get profile successful');
    } else {
      const error = await profileResponse.text();
      console.log('❌ Get profile failed:', error);
    }

    // Test update profile
    console.log('\n3.2 Testing update profile...');
    const updateProfileResponse = await fetch('http://localhost:3000/api/users/update-profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Test Master',
        bio: 'Updated bio'
      })
    });

    if (updateProfileResponse.ok) {
      const updateData = await updateProfileResponse.json();
      console.log('✅ Update profile successful');
    } else {
      const error = await updateProfileResponse.text();
      console.log('❌ Update profile failed:', error);
    }

    // ===== 4. TEST MASTER SEARCH =====
    console.log('\n📝 4. TESTING MASTER SEARCH APIs');
    console.log('='.repeat(50));

    // Test search masters
    console.log('\n4.1 Testing search masters...');
    const searchResponse = await fetch('http://localhost:3000/api/masters/search?sport=Calcio&location=Milano', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Search masters successful, found:', searchData.masters.length, 'masters');
    } else {
      const error = await searchResponse.text();
      console.log('❌ Search masters failed:', error);
    }

    // Test get master by ID
    if (masterId) {
      console.log('\n4.2 Testing get master by ID...');
      const masterByIdResponse = await fetch(`http://localhost:3000/api/masters/${masterId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (masterByIdResponse.ok) {
        const masterData = await masterByIdResponse.json();
        console.log('✅ Get master by ID successful');
      } else {
        const error = await masterByIdResponse.text();
        console.log('❌ Get master by ID failed:', error);
      }
    }

    // ===== 5. TEST AVAILABILITY APIs =====
    console.log('\n📝 5. TESTING AVAILABILITY APIs');
    console.log('='.repeat(50));

    // Test set availability (master)
    console.log('\n5.1 Testing set availability...');
    const setAvailabilityResponse = await fetch('http://localhost:3000/api/masters/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        availability: '{"monday": {"start": "09:00", "end": "18:00"}, "tuesday": {"start": "09:00", "end": "18:00"}}'
      })
    });

    if (setAvailabilityResponse.ok) {
      const availabilityData = await setAvailabilityResponse.json();
      console.log('✅ Set availability successful');
    } else {
      const error = await setAvailabilityResponse.text();
      console.log('❌ Set availability failed:', error);
    }

    // Test get public availability
    if (masterId) {
      console.log('\n5.2 Testing get public availability...');
      const publicAvailabilityResponse = await fetch(`http://localhost:3000/api/masters/availability-public?masterId=${masterId}&date=2025-07-28`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (publicAvailabilityResponse.ok) {
        const availabilityData = await publicAvailabilityResponse.json();
        console.log('✅ Get public availability successful, slots:', availabilityData.timeSlots.length);
      } else {
        const error = await publicAvailabilityResponse.text();
        console.log('❌ Get public availability failed:', error);
      }
    }

    // ===== 6. TEST APPOINTMENT APIs =====
    console.log('\n📝 6. TESTING APPOINTMENT APIs');
    console.log('='.repeat(50));

    // Test create appointment
    console.log('\n6.1 Testing create appointment...');
    const createAppointmentResponse = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        masterId: masterId,
        date: '2025-07-28',
        time: '19:00',
        duration: 60,
        notes: 'Test appointment',
        price: 50
      })
    });

    if (createAppointmentResponse.ok) {
      const appointmentData = await createAppointmentResponse.json();
      console.log('✅ Create appointment successful:', appointmentData.appointment.id);
      testAppointmentId = appointmentData.appointment.id;
    } else {
      const error = await createAppointmentResponse.text();
      console.log('❌ Create appointment failed:', error);
    }

    // Test get appointments
    console.log('\n6.2 Testing get appointments...');
    const getAppointmentsResponse = await fetch('http://localhost:3000/api/appointments', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (getAppointmentsResponse.ok) {
      const appointmentsData = await getAppointmentsResponse.json();
      console.log('✅ Get appointments successful, count:', appointmentsData.appointments.length);
    } else {
      const error = await getAppointmentsResponse.text();
      console.log('❌ Get appointments failed:', error);
    }

    // Test get appointment by ID
    if (testAppointmentId) {
      console.log('\n6.3 Testing get appointment by ID...');
      const getAppointmentResponse = await fetch(`http://localhost:3000/api/appointments/${testAppointmentId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (getAppointmentResponse.ok) {
        const appointmentData = await getAppointmentResponse.json();
        console.log('✅ Get appointment by ID successful');
      } else {
        const error = await getAppointmentResponse.text();
        console.log('❌ Get appointment by ID failed:', error);
      }

      // Test update appointment
      console.log('\n6.4 Testing update appointment...');
      const updateAppointmentResponse = await fetch(`http://localhost:3000/api/appointments/${testAppointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CONFIRMED',
          notes: 'Updated test appointment'
        })
      });

      if (updateAppointmentResponse.ok) {
        const updateData = await updateAppointmentResponse.json();
        console.log('✅ Update appointment successful');
      } else {
        const error = await updateAppointmentResponse.text();
        console.log('❌ Update appointment failed:', error);
      }
    }

    // ===== 7. TEST AUTH APIs =====
    console.log('\n📝 7. TESTING AUTH APIs');
    console.log('='.repeat(50));

    // Test check user
    console.log('\n7.1 Testing check user...');
    const checkUserResponse = await fetch('http://localhost:3000/api/users/check?email=test@example.com', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (checkUserResponse.ok) {
      const checkData = await checkUserResponse.json();
      console.log('✅ Check user successful');
    } else {
      const error = await checkUserResponse.text();
      console.log('❌ Check user failed:', error);
    }

    // Test update role
    console.log('\n7.2 Testing update role...');
    const updateRoleResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'MASTER'
      })
    });

    if (updateRoleResponse.ok) {
      const roleData = await updateRoleResponse.json();
      console.log('✅ Update role successful');
    } else {
      const error = await updateRoleResponse.text();
      console.log('❌ Update role failed:', error);
    }

    // Test complete profile
    console.log('\n7.3 Testing complete profile...');
    const completeProfileResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'MASTER',
        profile: testData.master.profile
      })
    });

    if (completeProfileResponse.ok) {
      const completeData = await completeProfileResponse.json();
      console.log('✅ Complete profile successful');
    } else {
      const error = await completeProfileResponse.text();
      console.log('❌ Complete profile failed:', error);
    }

    // ===== 8. TEST TIMEZONE CONVERSION =====
    console.log('\n📝 8. TESTING TIMEZONE CONVERSION');
    console.log('='.repeat(50));

    // Test timezone conversion
    const testDate = new Date('2025-07-28T19:00:00.000Z');
    console.log('\n8.1 Testing timezone conversion...');
    console.log('Input date (UTC):', testDate.toISOString());
    console.log('Local display:', testDate.toLocaleString());
    console.log('Timezone offset:', testDate.getTimezoneOffset(), 'minutes');

    // ===== 9. CLEANUP =====
    console.log('\n📝 9. CLEANUP');
    console.log('='.repeat(50));

    // Clean up test data
    console.log('\n9.1 Cleaning up test data...');
    if (testAppointmentId) {
      await prisma.appointment.delete({ where: { id: testAppointmentId } });
      console.log('✅ Deleted test appointment');
    }

    if (masterId) {
      await prisma.user.delete({ where: { id: masterId } });
      console.log('✅ Deleted test master');
    }

    if (studentId) {
      await prisma.user.delete({ where: { id: studentId } });
      console.log('✅ Deleted test student');
    }

    console.log('\n🎉 ALL TESTS COMPLETED!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllAPIs(); 