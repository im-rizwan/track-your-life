import emailjs from '@emailjs/nodejs';
import { config } from '../config/env.config';
import { ServiceUnavailableError } from '../errors/app-error';

export enum EmailPurpose {
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  ACCOUNT_DELETION = 'ACCOUNT_DELETION',
  EMAIL_CHANGE = 'EMAIL_CHANGE',
}

interface SendOtpEmailParams {
  to: string;
  otp: string;
  purpose: EmailPurpose;
  userName?: string;
}

export class EmailService {
  private serviceId: string;
  private templateId: string;
  private publicKey: string;
  private privateKey: string;

  constructor() {
    this.serviceId = config.emailjs.serviceId;
    this.templateId = config.emailjs.templateId;
    this.publicKey = config.emailjs.publicKey;
    this.privateKey = config.emailjs.privateKey;

    // Validate configuration
    if (!this.serviceId || !this.templateId || !this.publicKey || !this.privateKey) {
      throw new Error(
        'EmailJS configuration is incomplete. Please check your environment variables.'
      );
    }
  }

  /**
   * Get the purpose-specific message for the email
   */
  private getPurposeMessage(purpose: EmailPurpose): {
    subject: string;
    message: string;
  } {
    switch (purpose) {
      case EmailPurpose.EMAIL_VERIFICATION:
        return {
          subject: 'Verify Your Email - Muhasabah',
          message:
            'Welcome to Muhasabah! Please use the following code to verify your email address:',
        };
      case EmailPurpose.PASSWORD_RESET:
        return {
          subject: 'Password Reset Request - Muhasabah',
          message: 'You requested to reset your password. Use the following code to continue:',
        };
      case EmailPurpose.ACCOUNT_DELETION:
        return {
          subject: 'Account Deletion Confirmation - Muhasabah',
          message:
            'You requested to delete your account. Use the following code to confirm deletion:',
        };
      case EmailPurpose.EMAIL_CHANGE:
        return {
          subject: 'Email Change Verification - Muhasabah',
          message:
            'You requested to change your email address. Use the following code to verify your new email:',
        };
      default:
        return {
          subject: 'Verification Code - Muhasabah',
          message: 'Please use the following verification code:',
        };
    }
  }

  /**
   * Send OTP email using EmailJS
   * @throws Error if email sending fails
   */
  async sendOtpEmail(params: SendOtpEmailParams): Promise<void> {
    if (config.disableEmail) {
      console.log('📧 Email sending disabled (DISABLE_EMAIL=true). OTP still stored in DB.');
      return;
    }

    const { to, otp, purpose, userName } = params;
    const { subject, message } = this.getPurposeMessage(purpose);

    const templateParams = {
      to_email: to,
      to_name: userName || 'User',
      subject,
      message,
      otp_code: otp,
      purpose: purpose.toLowerCase().replace('_', ' '),
      app_name: 'Muhasabah',
      expiry_minutes: '2',
    };

    try {
      const response = await emailjs.send(this.serviceId, this.templateId, templateParams, {
        publicKey: this.publicKey,
        privateKey: this.privateKey,
      });

      // Verify successful response
      if (response.status !== 200) {
        throw new Error(`EmailJS returned status ${response.status}: ${response.text}`);
      }

      console.log('✅ Email sent successfully:', {
        to,
        purpose,
        status: response.status,
        text: response.text,
      });
    } catch (error) {
      // Log detailed error information for debugging (server-side only)
      console.error('❌ Failed to send email:', {
        to,
        purpose,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Re-throw with user-friendly message (no implementation details exposed)
      // This is CRITICAL for security - users must receive OTPs
      throw new ServiceUnavailableError(
        'Unable to send verification email. Please try again later or contact support if the issue persists.',
        'EMAIL_SERVICE_ERROR'
      );
    }
  }

  /**
   * Send account deletion confirmation email (no OTP needed)
   */
  async sendAccountDeletedConfirmation(email: string, userName?: string): Promise<void> {
    if (config.disableEmail) {
      console.log(
        '📧 Email sending disabled (DISABLE_EMAIL=true). Skipping deletion confirmation.'
      );
      return;
    }

    const templateParams = {
      to_email: email,
      to_name: userName || 'User',
      subject: 'Account Deleted - Muhasabah',
      message:
        'Your Muhasabah account has been successfully deleted. All your data has been removed from our system.',
      app_name: 'Muhasabah',
    };

    try {
      await emailjs.send(this.serviceId, this.templateId, templateParams, {
        publicKey: this.publicKey,
        privateKey: this.privateKey,
      });

      console.log('✅ Account deletion confirmation email sent:', { email });
    } catch (error) {
      // Log but don't throw - account is already deleted, email is just a courtesy
      console.error('❌ Failed to send account deletion confirmation:', {
        email,
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Note: We don't throw here because the account is already deleted
      // Failing to send a confirmation email shouldn't reverse the deletion
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
