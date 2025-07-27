// Test timezone conversions
console.log('=== TIMEZONE CONVERSION TEST ===\n');

// Simulate booking at 19:00 local time
const date = '2025-07-28';
const time = '19:00';

console.log('Input:');
console.log(`  Date: ${date}`);
console.log(`  Time: ${time}`);
console.log('');

// Create date in local timezone
const [year, month, day] = date.split('-').map(Number);
const [hour, minute] = time.split(':').map(Number);
const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);

console.log('Local date creation:');
console.log(`  Local date: ${localDate.toLocaleString()}`);
console.log(`  Local ISO: ${localDate.toISOString()}`);
console.log(`  Timezone offset: ${localDate.getTimezoneOffset()} minutes`);
console.log('');

// Convert to UTC
const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));

console.log('UTC conversion:');
console.log(`  UTC date: ${utcDate.toISOString()}`);
console.log(`  UTC local display: ${utcDate.toLocaleString()}`);
console.log('');

// Test reverse conversion (UTC back to local)
const backToLocal = new Date(utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000));
console.log('Reverse conversion (UTC back to local):');
console.log(`  Back to local: ${backToLocal.toLocaleString()}`);
console.log(`  Back to local ISO: ${backToLocal.toISOString()}`);
console.log('');

// Test what happens when we save UTC and display it
console.log('Simulation - Save UTC, display local:');
console.log(`  Saved in DB: ${utcDate.toISOString()}`);
console.log(`  Displayed to user: ${utcDate.toLocaleString()}`);
console.log('');

console.log('=== EXPECTED BEHAVIOR ===');
console.log('1. User selects 19:00 local time');
console.log('2. Save 17:00 UTC in database');
console.log('3. Display 19:00 local time everywhere');
console.log('4. Availability check: 17:00 UTC is booked'); 