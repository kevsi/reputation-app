import nodemailer from 'nodemailer';
import { logger } from '../logger';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    /**
     * Envoie un email
     */
    async sendEmail(options: EmailOptions): Promise<boolean> {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM || 'noreply@sentinelle-reputation.com',
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text,
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info('Email sent successfully:', info.messageId);

            return true;
        } catch (error) {
            logger.error('Error sending email:', error);
            return false;
        }
    }

    /**
     * Envoie une notification par email
     */
    async sendNotificationEmail(
        to: string,
        notification: {
            title: string;
            message: string;
            type: string;
        }
    ): Promise<boolean> {
        const subject = `Sentinelle - ${notification.title}`;
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>${notification.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { text-align: center; margin-bottom: 30px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
                    .content { margin-bottom: 30px; line-height: 1.6; }
                    .type { display: inline-block; padding: 4px 12px; background-color: #dbeafe; color: #1e40af; border-radius: 20px; font-size: 12px; text-transform: uppercase; }
                    .footer { text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="logo">Sentinelle Reputation</div>
                    </div>
                    <div class="content">
                        <span class="type">${notification.type.replace('_', ' ')}</span>
                        <h2>${notification.title}</h2>
                        <p>${notification.message}</p>
                    </div>
                    <div class="footer">
                        <p>Cette notification a été envoyée automatiquement par Sentinelle.</p>
                        <p>Vous pouvez modifier vos préférences de notification dans votre tableau de bord.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await this.sendEmail({
            to,
            subject,
            html,
            text: `${notification.title}\n\n${notification.message}`
        });
    }

    /**
     * Vérifie la connexion SMTP
     */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('SMTP connection verified successfully');
            return true;
        } catch (error) {
            logger.error('SMTP connection failed:', error);
            return false;
        }
    }
}

export const emailService = new EmailService();