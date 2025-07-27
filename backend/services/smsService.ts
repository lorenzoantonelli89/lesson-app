import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export interface SMSData {
  to: string;
  message: string;
}

export async function sendSMS(smsData: SMSData): Promise<boolean> {
  try {
    const { to, message } = smsData;
    
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    
    console.log('SMS sent successfully:', response.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
} 