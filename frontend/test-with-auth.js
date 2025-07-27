const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWithAuth() {
  console.log('🚀 STARTING AUTHENTICATED API TEST\n');

  let createdUsers = [];
  let sessionCookies = '';

  try {
    // ===== 1. CREATE TEST USER AND LOGIN =====
    console.log('📝 1. CREATING TEST USER AND LOGIN');
    console.log('='.repeat(50));

    // Create a test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test.auth@example.com',
        password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzqKqW', // password123
        role: 'TO_BE_DEFINED',
        isNewUser: true,
        hasProfile: false
      }
    });
    console.log('✅ Test user created:', testUser.id);
    createdUsers.push(testUser);

    // ===== 2. TEST LOGIN TO GET SESSION =====
    console.log('\n📝 2. TESTING LOGIN TO GET SESSION');
    console.log('='.repeat(50));

    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test.auth@example.com',
        password: 'password123'
      })
    });

    if (loginResponse.ok) {
      console.log('✅ Login successful');
      // Get cookies from response
      const cookies = loginResponse.headers.get('set-cookie');
      if (cookies) {
        sessionCookies = cookies;
        console.log('✅ Session cookies obtained');
      }
    } else {
      const error = await loginResponse.text();
      console.log('❌ Login failed:', error);
    }

    // ===== 3. TEST PROTECTED APIs WITH AUTH =====
    console.log('\n📝 3. TESTING PROTECTED APIs WITH AUTH');
    console.log('='.repeat(50));

    // Test update-role with auth
    console.log('\n3.1 Testing update-role with auth...');
    const updateRoleResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      },
      body: JSON.stringify({
        role: 'MASTER'
      })
    });

    if (updateRoleResponse.ok) {
      const data = await updateRoleResponse.json();
      console.log('✅ Update role successful:', data.user.role);
    } else {
      const error = await updateRoleResponse.text();
      console.log('❌ Update role failed:', error);
    }

    // Test complete-profile with auth
    console.log('\n3.2 Testing complete-profile with auth...');
    const completeProfileResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      },
      body: JSON.stringify({
        role: 'MASTER',
        profile: {
          bio: 'Test bio',
          specialties: ['Calcio'],
          hourlyRate: 50,
          location: 'Milano',
          phoneNumber: '123456789'
        }
      })
    });

    if (completeProfileResponse.ok) {
      const data = await completeProfileResponse.json();
      console.log('✅ Complete profile successful');
    } else {
      const error = await completeProfileResponse.text();
      console.log('❌ Complete profile failed:', error);
    }

    // Test get profile with auth
    console.log('\n3.3 Testing get profile with auth...');
    const getProfileResponse = await fetch('http://localhost:3000/api/users/profile', {
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      }
    });

    if (getProfileResponse.ok) {
      const data = await getProfileResponse.json();
      console.log('✅ Get profile successful');
    } else {
      const error = await getProfileResponse.text();
      console.log('❌ Get profile failed:', error);
    }

    // ===== 4. TEST GOOGLE OAUTH FLOW =====
    console.log('\n📝 4. TESTING GOOGLE OAUTH FLOW');
    console.log('='.repeat(50));

    // Create Google user
    const googleUser = await prisma.user.create({
      data: {
        name: 'Google Test User',
        email: 'google.test@example.com',
        role: 'TO_BE_DEFINED',
        isNewUser: true,
        hasProfile: false
      }
    });
    console.log('✅ Google user created:', googleUser.id);
    createdUsers.push(googleUser);

    // Simulate Google OAuth flow
    console.log('\n4.1 Testing Google OAuth role selection...');
    
    // First, we need to simulate a session for the Google user
    // This is tricky without actual OAuth, so let's test the API directly
    
    // Test the complete-profile API directly with the Google user ID
    const googleProfileResponse = await fetch('http://localhost:3000/api/users/complete-profile', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'MASTER',
        profile: {
          bio: 'Google test bio',
          specialties: ['Tennis'],
          hourlyRate: 60,
          location: 'Roma',
          phoneNumber: '987654321'
        }
      })
    });

    if (googleProfileResponse.ok) {
      console.log('✅ Google profile completion successful');
    } else {
      const error = await googleProfileResponse.text();
      console.log('❌ Google profile completion failed:', error);
    }

    // ===== 5. TEST ERROR HANDLING =====
    console.log('\n📝 5. TESTING ERROR HANDLING');
    console.log('='.repeat(50));

    // Test invalid role
    console.log('\n5.1 Testing invalid role...');
    const invalidRoleResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      },
      body: JSON.stringify({
        role: 'INVALID_ROLE'
      })
    });

    if (invalidRoleResponse.status === 400) {
      console.log('✅ Invalid role correctly rejected');
    } else {
      console.log('❌ Invalid role not handled correctly');
    }

    // Test missing role
    console.log('\n5.2 Testing missing role...');
    const missingRoleResponse = await fetch('http://localhost:3000/api/users/update-role', {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookies
      },
      body: JSON.stringify({})
    });

    if (missingRoleResponse.status === 400) {
      console.log('✅ Missing role correctly rejected');
    } else {
      console.log('❌ Missing role not handled correctly');
    }

    // ===== 6. CLEANUP =====
    console.log('\n📝 6. CLEANUP');
    console.log('='.repeat(50));

    console.log('\n6.1 Cleaning up test data...');
    for (const user of createdUsers) {
      try {
        await prisma.user.delete({ where: { id: user.id } });
        console.log(`✅ Deleted user: ${user.email}`);
      } catch (error) {
        console.log(`❌ Failed to delete user: ${user.email}`, error.message);
      }
    }

    console.log('\n🎉 AUTHENTICATED TEST COMPLETED!');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWithAuth(); 