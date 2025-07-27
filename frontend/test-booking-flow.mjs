import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// Test data
const random = Math.floor(Math.random() * 100000);
const studentEmail = `student${random}@test.com`;
const masterEmail = `master${random}@test.com`;

const studentData = {
  name: 'Test Student',
  email: studentEmail,
  password: 'password123',
  role: 'STUDENT'
};

const masterData = {
  name: 'Test Master',
  email: masterEmail,
  password: 'password123',
  role: 'MASTER',
  profile: {
    bio: 'Test bio',
    specialties: ['Tennis'],
    hourlyRate: 50,
    availability: 'Mon-Fri 9-18',
    location: 'Rome',
    phoneNumber: '123456789'
  }
};

let studentSession = null;
let masterSession = null;
let createdAppointment = null;

async function testCompleteBookingFlow() {
  console.log('🧪 TESTING COMPLETE BOOKING FLOW\n');
  
  try {
    // 1. Register student
    console.log('1️⃣ Registering student...');
    const studentResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    
    if (!studentResponse.ok) {
      const error = await studentResponse.text();
      throw new Error(`Student registration failed: ${error}`);
    }
    
    const studentResult = await studentResponse.json();
    console.log('✅ Student registered:', studentResult.user.email);
    
    // 2. Register master
    console.log('\n2️⃣ Registering master...');
    const masterResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(masterData)
    });
    
    if (!masterResponse.ok) {
      const error = await masterResponse.text();
      throw new Error(`Master registration failed: ${error}`);
    }
    
    const masterResult = await masterResponse.json();
    console.log('✅ Master registered:', masterResult.user.email);
    
    // 3. Login student
    console.log('\n3️⃣ Logging in student...');
    const studentLoginResponse = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: studentData.email,
        password: studentData.password
      })
    });
    
    if (!studentLoginResponse.ok) {
      const error = await studentLoginResponse.text();
      throw new Error(`Student login failed: ${error}`);
    }
    
    studentSession = studentLoginResponse.headers.get('set-cookie');
    console.log('✅ Student logged in');
    
    // 4. Login master
    console.log('\n4️⃣ Logging in master...');
    const masterLoginResponse = await fetch(`${BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: masterData.email,
        password: masterData.password
      })
    });
    
    if (!masterLoginResponse.ok) {
      const error = await masterLoginResponse.text();
      throw new Error(`Master login failed: ${error}`);
    }
    
    masterSession = masterLoginResponse.headers.get('set-cookie');
    console.log('✅ Master logged in');
    
    // 5. Get master availability (before booking)
    console.log('\n5️⃣ Getting master availability (before booking)...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    
    const availabilityResponse = await fetch(`${BASE_URL}/masters/availability-public?date=${dateString}&masterId=${masterResult.user.id}`);
    
    if (!availabilityResponse.ok) {
      const error = await availabilityResponse.text();
      throw new Error(`Availability check failed: ${error}`);
    }
    
    const availability = await availabilityResponse.json();
    console.log('✅ Availability retrieved');
    console.log('Available slots:', availability.availability.timeSlots.filter(slot => slot.available).length);
    
    // 6. Book appointment at 10:00
    console.log('\n6️⃣ Booking appointment at 10:00...');
    const bookingTime = '10:00';
    const bookingDate = dateString;
    
    const bookingResponse = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': studentSession
      },
      body: JSON.stringify({
        masterId: masterResult.user.id,
        date: bookingDate,
        time: bookingTime,
        duration: 60,
        notes: 'Test booking'
      })
    });
    
    if (!bookingResponse.ok) {
      const error = await bookingResponse.text();
      throw new Error(`Booking failed: ${error}`);
    }
    
    const bookingResult = await bookingResponse.json();
    createdAppointment = bookingResult.appointment;
    console.log('✅ Appointment booked');
    console.log('Appointment ID:', createdAppointment.id);
    console.log('Booked time (UTC):', createdAppointment.date);
    console.log('Booked time (Local):', new Date(createdAppointment.date).toLocaleString());
    
    // 7. Check availability after booking
    console.log('\n7️⃣ Checking availability after booking...');
    const availabilityAfterResponse = await fetch(`${BASE_URL}/masters/availability-public?date=${dateString}&masterId=${masterResult.user.id}`);
    
    if (!availabilityAfterResponse.ok) {
      const error = await availabilityAfterResponse.text();
      throw new Error(`Post-booking availability check failed: ${error}`);
    }
    
    const availabilityAfter = await availabilityAfterResponse.json();
    const bookedSlot = availabilityAfter.availability.timeSlots.find(slot => slot.time === bookingTime);
    
    console.log('✅ Post-booking availability retrieved');
    console.log(`Slot ${bookingTime} available:`, bookedSlot.available);
    
    if (bookedSlot.available) {
      console.log('❌ ERROR: Booked slot still shows as available!');
    } else {
      console.log('✅ Booked slot correctly shows as unavailable');
    }
    
    // 8. Master accepts appointment
    console.log('\n8️⃣ Master accepting appointment...');
    const acceptResponse = await fetch(`${BASE_URL}/appointments/${createdAppointment.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': masterSession
      },
      body: JSON.stringify({
        status: 'CONFIRMED'
      })
    });
    
    if (!acceptResponse.ok) {
      const error = await acceptResponse.text();
      throw new Error(`Appointment acceptance failed: ${error}`);
    }
    
    console.log('✅ Appointment accepted by master');
    
    // 9. Try to book another appointment at the same time
    console.log('\n9️⃣ Trying to book another appointment at the same time...');
    const duplicateBookingResponse = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': studentSession
      },
      body: JSON.stringify({
        masterId: masterResult.user.id,
        date: bookingDate,
        time: bookingTime,
        duration: 60,
        notes: 'Duplicate booking attempt'
      })
    });
    
    if (duplicateBookingResponse.ok) {
      console.log('❌ ERROR: Duplicate booking was allowed!');
    } else {
      console.log('✅ Duplicate booking correctly rejected');
    }
    
    // 10. Try to book at 11:00 (should be available)
    console.log('\n🔟 Trying to book at 11:00...');
    const secondBookingResponse = await fetch(`${BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': studentSession
      },
      body: JSON.stringify({
        masterId: masterResult.user.id,
        date: bookingDate,
        time: '11:00',
        duration: 60,
        notes: 'Second booking'
      })
    });
    
    if (!secondBookingResponse.ok) {
      const error = await secondBookingResponse.text();
      console.log('❌ Second booking failed:', error);
    } else {
      console.log('✅ Second booking successful');
    }
    
    // 11. Final availability check
    console.log('\n1️⃣1️⃣ Final availability check...');
    const finalAvailabilityResponse = await fetch(`${BASE_URL}/masters/availability-public?date=${dateString}&masterId=${masterResult.user.id}`);
    
    if (!finalAvailabilityResponse.ok) {
      const error = await finalAvailabilityResponse.text();
      throw new Error(`Final availability check failed: ${error}`);
    }
    
    const finalAvailability = await finalAvailabilityResponse.json();
    const availableSlots = finalAvailability.availability.timeSlots.filter(slot => slot.available);
    
    console.log('✅ Final availability retrieved');
    console.log('Available slots:', availableSlots.length);
    console.log('Available times:', availableSlots.map(slot => slot.time).slice(0, 5));
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY!');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testCompleteBookingFlow(); 