const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test scenarios
const scenarios = {
  manualMaster: {
    name: 'Test Master Manual',
    email: 'master.manual@test.com',
    password: 'password123',
    role: 'MASTER',
    profile: {
      bio: 'Test bio manual',
      specialties: ['Calcio', 'Tennis'],
      hourlyRate: 50,
      location: 'Milano',
      phoneNumber: '123456789'
    }
  },
  manualStudent: {
    name: 'Test Student Manual',
    email: 'student.manual@test.com',
    password: 'password123',
    role: 'STUDENT',
    profile: {
      skillLevel: 'Intermedio',
      goals: ['Migliorare tecnica'],
      preferredSports: ['Calcio'],
      medicalInfo: 'Nessuna'
    }
  },
  googleMaster: {
    name: 'Test Master Google',
    email: 'master.google@test.com',
    role: 'MASTER',
    profile: {
      bio: 'Test bio google',
      specialties: ['Calcio'],
      hourlyRate: 60,
      location: 'Roma',
      phoneNumber: '987654321'
    }
  },
  googleStudent: {
    name: 'Test Student Google',
    email: 'student.google@test.com',
    role: 'STUDENT',
    profile: {
      skillLevel: 'Principiante',
      goals: ['Imparare le basi'],
      preferredSports: ['Tennis'],
      medicalInfo: 'Nessuna'
    }
  }
};

async function testCompleteScenarios() {
  console.log('🚀 STARTING COMPLETE SCENARIO TEST\n');

  let createdUsers = [];

  try {
    // ===== 1. TEST MANUAL REGISTRATION SCENARIOS =====
    console.log('📝 1. TESTING MANUAL REGISTRATION SCENARIOS');
    console.log('='.repeat(60));

    // Test 1.1: Manual Master Registration
    console.log('\n1.1 Testing manual master registration...');
    const manualMasterResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarios.manualMaster)
    });

    if (manualMasterResponse.ok) {
      const data = await manualMasterResponse.json();
      console.log('✅ Manual master registration successful:', data.user.id);
      createdUsers.push({ id: data.user.id, email: scenarios.manualMaster.email });
    } else {
      const error = await manualMasterResponse.text();
      console.log('❌ Manual master registration failed:', error);
    }

    // Test 1.2: Manual Student Registration
    console.log('\n1.2 Testing manual student registration...');
    const manualStudentResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarios.manualStudent)
    });

    if (manualStudentResponse.ok) {
      const data = await manualStudentResponse.json();
      console.log('✅ Manual student registration successful:', data.user.id);
      createdUsers.push({ id: data.user.id, email: scenarios.manualStudent.email });
    } else {
      const error = await manualStudentResponse.text();
      console.log('❌ Manual student registration failed:', error);
    }

    // ===== 2. TEST LOGIN SCENARIOS =====
    console.log('\n📝 2. TESTING LOGIN SCENARIOS');
    console.log('='.repeat(60));

    // Test 2.1: Manual Master Login
    console.log('\n2.1 Testing manual master login...');
    const manualMasterLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: scenarios.manualMaster.email,
        password: scenarios.manualMaster.password
      })
    });

    if (manualMasterLoginResponse.ok) {
      console.log('✅ Manual master login successful');
    } else {
      const error = await manualMasterLoginResponse.text();
      console.log('❌ Manual master login failed:', error);
    }

    // Test 2.2: Manual Student Login
    console.log('\n2.2 Testing manual student login...');
    const manualStudentLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: scenarios.manualStudent.email,
        password: scenarios.manualStudent.password
      })
    });

    if (manualStudentLoginResponse.ok) {
      console.log('✅ Manual student login successful');
    } else {
      const error = await manualStudentLoginResponse.text();
      console.log('❌ Manual student login failed:', error);
    }

    // ===== 3. TEST GOOGLE OAUTH FLOW SIMULATION =====
    console.log('\n📝 3. TESTING GOOGLE OAUTH FLOW SIMULATION');
    console.log('='.repeat(60));

    // Test 3.1: Simulate Google OAuth Master Registration
    console.log('\n3.1 Testing Google OAuth master flow...');
    
    // Step 1: Create user with Google data (simulating OAuth)
    const googleMasterUser = await prisma.user.create({
      data: {
        name: scenarios.googleMaster.name,
        email: scenarios.googleMaster.email,
        role: 'TO_BE_DEFINED',
        isNewUser: true,
        hasProfile: false
      }
    });
    console.log('✅ Google master user created:', googleMasterUser.id);
    createdUsers.push({ id: googleMasterUser.id, email: scenarios.googleMaster.email });

    // Step 2: Test role selection (update-role API)
    console.log('\n3.2 Testing role selection for Google master...');
    const updateRoleResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'MASTER'
      })
    });

    if (updateRoleResponse.ok) {
      console.log('✅ Role selection successful');
    } else {
      const error = await updateRoleResponse.text();
      console.log('❌ Role selection failed:', error);
    }

    // Step 3: Test profile completion for Google master
    console.log('\n3.3 Testing profile completion for Google master...');
    const completeProfileResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'MASTER',
        profile: scenarios.googleMaster.profile
      })
    });

    if (completeProfileResponse.ok) {
      console.log('✅ Profile completion successful');
    } else {
      const error = await completeProfileResponse.text();
      console.log('❌ Profile completion failed:', error);
    }

    // Test 3.4: Simulate Google OAuth Student Registration
    console.log('\n3.4 Testing Google OAuth student flow...');
    
    // Step 1: Create user with Google data (simulating OAuth)
    const googleStudentUser = await prisma.user.create({
      data: {
        name: scenarios.googleStudent.name,
        email: scenarios.googleStudent.email,
        role: 'TO_BE_DEFINED',
        isNewUser: true,
        hasProfile: false
      }
    });
    console.log('✅ Google student user created:', googleStudentUser.id);
    createdUsers.push({ id: googleStudentUser.id, email: scenarios.googleStudent.email });

    // Step 2: Test role selection for Google student
    console.log('\n3.5 Testing role selection for Google student...');
    const updateRoleStudentResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'STUDENT'
      })
    });

    if (updateRoleStudentResponse.ok) {
      console.log('✅ Student role selection successful');
    } else {
      const error = await updateRoleStudentResponse.text();
      console.log('❌ Student role selection failed:', error);
    }

    // Step 3: Test profile completion for Google student
    console.log('\n3.6 Testing profile completion for Google student...');
    const completeProfileStudentResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: 'STUDENT',
        profile: scenarios.googleStudent.profile
      })
    });

    if (completeProfileStudentResponse.ok) {
      console.log('✅ Student profile completion successful');
    } else {
      const error = await completeProfileStudentResponse.text();
      console.log('❌ Student profile completion failed:', error);
    }

    // ===== 4. TEST API ENDPOINTS =====
    console.log('\n📝 4. TESTING API ENDPOINTS');
    console.log('='.repeat(60));

    // Test 4.1: Check user API
    console.log('\n4.1 Testing check user API...');
    const checkUserResponse = await fetch('http://localhost:3000/api/users/check?email=test@example.com', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (checkUserResponse.ok) {
      console.log('✅ Check user API successful');
    } else {
      const error = await checkUserResponse.text();
      console.log('❌ Check user API failed:', error);
    }

    // Test 4.2: Search masters API
    console.log('\n4.2 Testing search masters API...');
    const searchMastersResponse = await fetch('http://localhost:3000/api/masters/search?sport=Calcio&location=Milano', {
      headers: { 'Content-Type': 'application/json' }
    });

    if (searchMastersResponse.ok) {
      const data = await searchMastersResponse.json();
      console.log('✅ Search masters API successful, found:', data.masters?.length || 0, 'masters');
    } else {
      const error = await searchMastersResponse.text();
      console.log('❌ Search masters API failed:', error);
    }

    // Test 4.3: Availability API
    console.log('\n4.3 Testing availability API...');
    if (createdUsers.length > 0) {
      const availabilityResponse = await fetch(`http://localhost:3000/api/masters/availability-public?masterId=${createdUsers[0].id}&date=2025-07-28`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (availabilityResponse.ok) {
        const data = await availabilityResponse.json();
        console.log('✅ Availability API successful, slots:', data.timeSlots?.length || 0);
      } else {
        const error = await availabilityResponse.text();
        console.log('❌ Availability API failed:', error);
      }
    }

    // ===== 5. TEST ERROR SCENARIOS =====
    console.log('\n📝 5. TESTING ERROR SCENARIOS');
    console.log('='.repeat(60));

    // Test 5.1: Duplicate registration
    console.log('\n5.1 Testing duplicate registration...');
    const duplicateResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarios.manualMaster)
    });

    if (duplicateResponse.status === 400) {
      console.log('✅ Duplicate registration correctly rejected');
    } else {
      console.log('❌ Duplicate registration not handled correctly');
    }

    // Test 5.2: Invalid role
    console.log('\n5.2 Testing invalid role...');
    const invalidRoleResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...scenarios.manualMaster,
        role: 'INVALID_ROLE'
      })
    });

    if (invalidRoleResponse.status === 400) {
      console.log('✅ Invalid role correctly rejected');
    } else {
      console.log('❌ Invalid role not handled correctly');
    }

    // Test 5.3: Missing fields
    console.log('\n5.3 Testing missing fields...');
    const missingFieldsResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com'
        // Missing password and role
      })
    });

    if (missingFieldsResponse.status === 400) {
      console.log('✅ Missing fields correctly rejected');
    } else {
      console.log('❌ Missing fields not handled correctly');
    }

    // ===== 6. CLEANUP =====
    console.log('\n📝 6. CLEANUP');
    console.log('='.repeat(60));

    console.log('\n6.1 Cleaning up test data...');
    for (const user of createdUsers) {
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`✅ Deleted user: ${user.email}`);
      } catch (error) {
        console.log(`❌ Failed to delete user: ${user.email}`, error.message);
      }
    }

    console.log('\n🎉 ALL SCENARIOS COMPLETED!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteScenarios(); 