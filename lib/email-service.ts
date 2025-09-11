import nodemailer from 'nodemailer';
import { render } from '@react-email/components';
import React from 'react';
import { 
  WelcomeEmail, 
  LoginNotificationEmail, 
  DepositConfirmationEmail, 
  WithdrawalConfirmationEmail,
  InvestmentConfirmationEmail,
  InvestmentCompletionEmail,
  KycUpdateEmail,
  PasswordResetEmail,
  EmailVerificationEmail,
  TransactionStatusEmail
} from '@/emails';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailTemplate {
  name: string;
  subject: string;
  component: React.ComponentType<any>;
}

export const emailTemplates: Record<string, EmailTemplate> = {
  welcome: {
    name: 'Welcome',
    subject: 'Welcome to CryptVest - Your Investment Journey Begins!',
    component: WelcomeEmail,
  },
  login: {
    name: 'Login Notification',
    subject: 'New Login Detected - CryptVest',
    component: LoginNotificationEmail,
  },
  deposit: {
    name: 'Deposit Confirmation',
    subject: 'Deposit Confirmed - CryptVest',
    component: DepositConfirmationEmail,
  },
  withdrawal: {
    name: 'Withdrawal Confirmation',
    subject: 'Withdrawal Confirmed - CryptVest',
    component: WithdrawalConfirmationEmail,
  },
  investment: {
    name: 'Investment Confirmation',
    subject: 'Investment Confirmed - CryptVest',
    component: InvestmentConfirmationEmail,
  },
  investment_completion: {
    name: 'Investment Completion',
    subject: 'Investment Completed - CryptVest',
    component: InvestmentCompletionEmail,
  },
  kyc_update: {
    name: 'KYC Update',
    subject: 'KYC Status Update - CryptVest',
    component: KycUpdateEmail,
  },
  password_reset: {
    name: 'Password Reset',
    subject: 'Password Reset Request - CryptVest',
    component: PasswordResetEmail,
  },
  email_verification: {
    name: 'Email Verification',
    subject: 'Verify Your Email - CryptVest',
    component: EmailVerificationEmail,
  },
  transaction_status: {
    name: 'Transaction Status',
    subject: 'Transaction Status Update - CryptVest',
    component: TransactionStatusEmail,
  },
};

export interface EmailData {
  to: string;
  toName?: string;
  template: string;
  variables: Record<string, any>;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = transporter;
  }

  async sendEmail(data: EmailData): Promise<boolean> {
    try {
      const template = emailTemplates[data.template];
      if (!template) {
        throw new Error(`Email template '${data.template}' not found`);
      }

      // Render the email component
      const emailHtml = await render(React.createElement(template.component, data.variables));
      
      // Create text version (simple fallback)
      const textContent = this.htmlToText(emailHtml);

      const mailOptions = {
        from: `"CryptVest" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: data.toName ? `${data.toName} <${data.to}>` : data.to,
        subject: template.subject,
        html: emailHtml,
        text: textContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  async sendBulkEmails(emails: EmailData[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendEmail(email);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }

  private htmlToText(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  // Test email configuration
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
