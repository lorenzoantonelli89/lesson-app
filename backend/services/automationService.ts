import { prisma } from '../lib/prisma';
import { sendEmail } from './emailService';
import { sendSMS } from './smsService';

export interface CancellationNotification {
  appointmentId: string;
  cancelledBy: string;
  reason?: string;
  potentialReplacements?: string[];
}

export class AutomationService {
  /**
   * Handle appointment cancellation and notify potential replacements
   */
  static async handleCancellation(appointmentId: string, cancelledBy: string, reason?: string) {
    try {
      // Get the cancelled appointment
      const appointment = await prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          master: {
            include: {
              masterProfile: true,
            },
          },
          student: {
            include: {
              studentProfile: true,
            },
          },
        },
      });

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Update appointment status
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy,
          cancellationReason: reason,
        },
      });

      // Find potential replacements (other students with similar interests)
      const potentialReplacements = await this.findPotentialReplacements(appointment);

      // Send notifications
      await this.sendCancellationNotifications({
        appointmentId,
        cancelledBy,
        reason,
        potentialReplacements: potentialReplacements.map(r => r.id),
      });

      // Create automation record
      await prisma.automation.create({
        data: {
          userId: appointment.masterId,
          appointmentId,
          type: 'CANCELLATION_NOTIFICATION',
          trigger: 'ON_CANCELLATION',
          conditions: {
            cancelledBy,
            reason,
            hasReplacements: potentialReplacements.length > 0,
          },
          actions: {
            notificationsSent: true,
            replacementsFound: potentialReplacements.length,
          },
        },
      });

      return {
        success: true,
        potentialReplacements: potentialReplacements.length,
      };
    } catch (error) {
      console.error('Error handling cancellation:', error);
      throw error;
    }
  }

  /**
   * Find potential replacement students
   */
  private static async findPotentialReplacements(appointment: any) {
    const { masterId, startTime, endTime, tags } = appointment;

    // Find students with similar interests and availability
    const potentialReplacements = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        studentProfile: {
          preferredSports: {
            hasSome: appointment.master.masterProfile.specialties,
          },
        },
        appointmentsAsStudent: {
          none: {
            startTime: {
              gte: startTime,
              lte: endTime,
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED'],
            },
          },
        },
      },
      include: {
        studentProfile: {
          select: {
            skillLevel: true,
            preferredSports: true,
          },
        },
      },
      take: 5, // Limit to 5 potential replacements
    });

    return potentialReplacements;
  }

  /**
   * Send cancellation notifications
   */
  private static async sendCancellationNotifications(notification: CancellationNotification) {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: notification.appointmentId },
        include: {
          master: true,
          student: true,
        },
      });

      if (!appointment) return;

      // Notify the master
      if (appointment.master.email) {
        await sendEmail({
          to: appointment.master.email,
          subject: 'Appointment Cancellation',
          template: 'cancellation-notification',
          data: {
            appointment,
            cancelledBy: notification.cancelledBy,
            reason: notification.reason,
            potentialReplacements: notification.potentialReplacements?.length || 0,
          },
        });
      }

      // Notify potential replacements
      if (notification.potentialReplacements && notification.potentialReplacements.length > 0) {
        const replacements = await prisma.user.findMany({
          where: {
            id: {
              in: notification.potentialReplacements,
            },
          },
        });

        for (const replacement of replacements) {
          if (replacement.email) {
            await sendEmail({
              to: replacement.email,
              subject: 'New Appointment Opportunity',
              template: 'replacement-opportunity',
              data: {
                appointment,
                master: appointment.master,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('Error sending cancellation notifications:', error);
    }
  }

  /**
   * Trigger automation based on conditions
   */
  static async triggerAutomation(appointmentId: string, trigger: string) {
    try {
      const automations = await prisma.automation.findMany({
        where: {
          appointmentId,
          trigger: trigger as any,
          isActive: true,
        },
      });

      for (const automation of automations) {
        await this.executeAutomation(automation);
      }
    } catch (error) {
      console.error('Error triggering automation:', error);
    }
  }

  /**
   * Execute automation actions
   */
  private static async executeAutomation(automation: any) {
    try {
      const actions = automation.actions as any;

      if (actions.sendReminder) {
        await this.sendReminder(automation.appointmentId);
      }

      if (actions.sendFollowUp) {
        await this.sendFollowUp(automation.appointmentId);
      }

      // Update execution count
      await prisma.automation.update({
        where: { id: automation.id },
        data: {
          executionCount: automation.executionCount + 1,
          lastTriggered: new Date(),
        },
      });
    } catch (error) {
      console.error('Error executing automation:', error);
    }
  }

  /**
   * Send appointment reminder
   */
  private static async sendReminder(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        master: true,
        student: true,
      },
    });

    if (!appointment) return;

    // Send email reminder
    if (appointment.student.email) {
      await sendEmail({
        to: appointment.student.email,
        subject: 'Appointment Reminder',
        template: 'appointment-reminder',
        data: { appointment },
      });
    }

    // Send SMS reminder (if phone number is available in student profile)
    // Note: phoneNumber is not in the base User model, so we'll skip SMS for now
    // In a real implementation, you'd need to add phoneNumber to User or StudentProfile
    console.log('SMS reminder skipped - phoneNumber not available in User model');
  }

  /**
   * Send follow-up message
   */
  private static async sendFollowUp(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        master: true,
        student: true,
      },
    });

    if (!appointment) return;

    if (appointment.student.email) {
      await sendEmail({
        to: appointment.student.email,
        subject: 'How was your session?',
        template: 'follow-up',
        data: { appointment },
      });
    }
  }
} 