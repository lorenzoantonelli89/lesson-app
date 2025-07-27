import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const { to, subject, template, data } = emailData;
    
    // In a real implementation, you would use a template engine
    // For now, we'll create a simple HTML email
    const htmlContent = generateEmailContent(template, data);
    
    const messageData = {
      from: `Lesson App <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to: [to],
      subject: subject,
      html: htmlContent,
    };

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN!, messageData);
    
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

function generateEmailContent(template: string, data: any): string {
  switch (template) {
    case 'cancellation-notification':
      return `
        <h2>Appointment Cancellation</h2>
        <p>An appointment has been cancelled.</p>
        <p><strong>Date:</strong> ${data.appointment.startTime.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.appointment.startTime.toLocaleTimeString()}</p>
        <p><strong>Cancelled by:</strong> ${data.cancelledBy}</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
        <p><strong>Potential replacements found:</strong> ${data.potentialReplacements}</p>
      `;
    
    case 'replacement-opportunity':
      return `
        <h2>New Appointment Opportunity</h2>
        <p>A new appointment slot has become available!</p>
        <p><strong>Master:</strong> ${data.master.name}</p>
        <p><strong>Date:</strong> ${data.appointment.startTime.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.appointment.startTime.toLocaleTimeString()}</p>
        <p><strong>Duration:</strong> ${data.appointment.duration} minutes</p>
        <p><strong>Price:</strong> $${data.appointment.price}</p>
      `;
    
    case 'appointment-reminder':
      return `
        <h2>Appointment Reminder</h2>
        <p>You have an upcoming appointment!</p>
        <p><strong>Master:</strong> ${data.appointment.master.name}</p>
        <p><strong>Date:</strong> ${data.appointment.startTime.toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.appointment.startTime.toLocaleTimeString()}</p>
        <p><strong>Location:</strong> ${data.appointment.location || 'Online'}</p>
      `;
    
    case 'follow-up':
      return `
        <h2>How was your session?</h2>
        <p>We hope you enjoyed your session with ${data.appointment.master.name}!</p>
        <p>Please take a moment to provide feedback about your experience.</p>
      `;
    
    default:
      return `
        <h2>Lesson App Notification</h2>
        <p>You have a new notification from the Lesson App.</p>
      `;
  }
} 