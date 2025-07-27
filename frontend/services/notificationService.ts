// Notification Service for automatic notifications
// This is a placeholder service that would integrate with email/SMS providers

interface NotificationData {
  type: 'appointment_confirmed' | 'appointment_reminder' | 'appointment_cancelled' | 'new_appointment';
  recipient: {
    email: string;
    name: string;
  };
  appointment: {
    id: string;
    date: string;
    duration: number;
    masterName: string;
    studentName: string;
    location: string;
    price: number;
  };
  template?: string;
}

class NotificationService {
  private emailProvider: any; // Would be Mailgun or similar
  private smsProvider: any; // Would be Twilio or similar

  constructor() {
    // Initialize providers in real implementation
    this.emailProvider = null;
    this.smsProvider = null;
  }

  async sendEmailNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📧 Sending email notification:', {
        to: data.recipient.email,
        type: data.type,
        appointmentId: data.appointment.id
      });

      // In real implementation, this would use Mailgun or similar
      const emailContent = this.generateEmailContent(data);
      
      // Placeholder for email sending
      // await this.emailProvider.send({
      //   to: data.recipient.email,
      //   subject: emailContent.subject,
      //   html: emailContent.html,
      //   text: emailContent.text
      // });

      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  async sendSMSNotification(data: NotificationData): Promise<boolean> {
    try {
      console.log('📱 Sending SMS notification:', {
        type: data.type,
        appointmentId: data.appointment.id
      });

      // In real implementation, this would use Twilio or similar
      const smsContent = this.generateSMSContent(data);
      
      // Placeholder for SMS sending
      // await this.smsProvider.send({
      //   to: data.recipient.phone,
      //   body: smsContent
      // });

      return true;
    } catch (error) {
      console.error('Error sending SMS notification:', error);
      return false;
    }
  }

  private generateEmailContent(data: NotificationData) {
    const appointmentDate = new Date(data.appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (data.type) {
      case 'appointment_confirmed':
        return {
          subject: 'Appuntamento Confermato - Lezione Sportiva',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">✅ Appuntamento Confermato</h2>
              <p>Ciao ${data.recipient.name},</p>
              <p>Il tuo appuntamento è stato confermato!</p>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Dettagli Appuntamento</h3>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Orario:</strong> ${formattedTime}</p>
                <p><strong>Durata:</strong> ${data.appointment.duration} minuti</p>
                <p><strong>Maestro:</strong> ${data.appointment.masterName}</p>
                <p><strong>Luogo:</strong> ${data.appointment.location}</p>
                <p><strong>Prezzo:</strong> €${data.appointment.price.toFixed(2)}</p>
              </div>
              <p>Ti aspettiamo!</p>
            </div>
          `,
          text: `Appuntamento confermato per ${formattedDate} alle ${formattedTime} con ${data.appointment.masterName}`
        };

      case 'appointment_reminder':
        return {
          subject: 'Promemoria Appuntamento - Domani',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #f59e0b;">⏰ Promemoria Appuntamento</h2>
              <p>Ciao ${data.recipient.name},</p>
              <p>Ti ricordiamo il tuo appuntamento di domani!</p>
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Dettagli Appuntamento</h3>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Orario:</strong> ${formattedTime}</p>
                <p><strong>Durata:</strong> ${data.appointment.duration} minuti</p>
                <p><strong>Maestro:</strong> ${data.appointment.masterName}</p>
                <p><strong>Luogo:</strong> ${data.appointment.location}</p>
              </div>
              <p>Non dimenticare di portare l'attrezzatura necessaria!</p>
            </div>
          `,
          text: `Promemoria: appuntamento domani ${formattedDate} alle ${formattedTime} con ${data.appointment.masterName}`
        };

      case 'appointment_cancelled':
        return {
          subject: 'Appuntamento Cancellato - Lezione Sportiva',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc2626;">❌ Appuntamento Cancellato</h2>
              <p>Ciao ${data.recipient.name},</p>
              <p>Il tuo appuntamento è stato cancellato.</p>
              <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Dettagli Appuntamento</h3>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Orario:</strong> ${formattedTime}</p>
                <p><strong>Maestro:</strong> ${data.appointment.masterName}</p>
              </div>
              <p>Contattaci per prenotare un nuovo appuntamento.</p>
            </div>
          `,
          text: `Appuntamento cancellato per ${formattedDate} alle ${formattedTime} con ${data.appointment.masterName}`
        };

      case 'new_appointment':
        return {
          subject: 'Nuova Prenotazione Ricevuta',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #059669;">🎯 Nuova Prenotazione</h2>
              <p>Ciao ${data.recipient.name},</p>
              <p>Hai ricevuto una nuova prenotazione!</p>
              <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Dettagli Prenotazione</h3>
                <p><strong>Studente:</strong> ${data.appointment.studentName}</p>
                <p><strong>Data:</strong> ${formattedDate}</p>
                <p><strong>Orario:</strong> ${formattedTime}</p>
                <p><strong>Durata:</strong> ${data.appointment.duration} minuti</p>
                <p><strong>Prezzo:</strong> €${data.appointment.price.toFixed(2)}</p>
              </div>
              <p>Accedi alla dashboard per confermare o rifiutare la prenotazione.</p>
            </div>
          `,
          text: `Nuova prenotazione da ${data.appointment.studentName} per ${formattedDate} alle ${formattedTime}`
        };

      default:
        return {
          subject: 'Notifica Appuntamento',
          html: '<p>Notifica appuntamento</p>',
          text: 'Notifica appuntamento'
        };
    }
  }

  private generateSMSContent(data: NotificationData): string {
    const appointmentDate = new Date(data.appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
    const formattedTime = appointmentDate.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (data.type) {
      case 'appointment_confirmed':
        return `✅ Appuntamento confermato: ${formattedDate} alle ${formattedTime} con ${data.appointment.masterName}`;
      
      case 'appointment_reminder':
        return `⏰ Promemoria: domani ${formattedDate} alle ${formattedTime} lezione con ${data.appointment.masterName}`;
      
      case 'appointment_cancelled':
        return `❌ Appuntamento cancellato: ${formattedDate} alle ${formattedTime}`;
      
      case 'new_appointment':
        return `🎯 Nuova prenotazione da ${data.appointment.studentName}: ${formattedDate} alle ${formattedTime}`;
      
      default:
        return 'Notifica appuntamento';
    }
  }

  // Public methods for different notification types
  async sendAppointmentConfirmed(data: NotificationData): Promise<boolean> {
    data.type = 'appointment_confirmed';
    return await this.sendEmailNotification(data);
  }

  async sendAppointmentReminder(data: NotificationData): Promise<boolean> {
    data.type = 'appointment_reminder';
    const emailSent = await this.sendEmailNotification(data);
    const smsSent = await this.sendSMSNotification(data);
    return emailSent || smsSent;
  }

  async sendAppointmentCancelled(data: NotificationData): Promise<boolean> {
    data.type = 'appointment_cancelled';
    return await this.sendEmailNotification(data);
  }

  async sendNewAppointment(data: NotificationData): Promise<boolean> {
    data.type = 'new_appointment';
    return await this.sendEmailNotification(data);
  }
}

export const notificationService = new NotificationService(); 