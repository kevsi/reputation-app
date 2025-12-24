import { Job } from 'bull';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { logger } from '../utils/logger';

interface NotificationJobData {
  type: 'email' | 'sms' | 'push';
  to: string;
  subject?: string;
  message: string;
  template?: string;
  data?: Record<string, any>;
}

// Configuration email
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Configuration SMS
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const notificationsProcessor = async (job: Job<NotificationJobData>) => {
  const { type, to, subject, message, template, data } = job.data;

  try {
    logger.info(`Sending ${type} notification to ${to}`);

    switch (type) {
      case 'email':
        await sendEmail({ to, subject: subject!, message, template, data });
        break;

      case 'sms':
        await sendSMS({ to, message });
        break;

      case 'push':
        await sendPushNotification({ to, message, data });
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    logger.info(`${type} notification sent successfully to ${to}`);

  } catch (error) {
    logger.error(`Failed to send ${type} notification to ${to}`, error);
    throw error;
  }
};

async function sendEmail(params: {
  to: string;
  subject: string;
  message: string;
  template?: string;
  data?: Record<string, any>;
}) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.template 
      ? renderTemplate(params.template, params.data || {})
      : params.message,
  };

  await emailTransporter.sendMail(mailOptions);
}

async function sendSMS(params: { to: string; message: string }) {
  await twilioClient.messages.create({
    body: params.message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: params.to,
  });
}

async function sendPushNotification(params: {
  to: string;
  message: string;
  data?: Record<string, any>;
}) {
  // TODO: Implémenter push notifications (Firebase, OneSignal, etc.)
  logger.info('Push notification not yet implemented');
}

function renderTemplate(template: string, data: Record<string, any>): string {
  // TODO: Utiliser un moteur de templates (Handlebars, EJS, etc.)
  return template;
}