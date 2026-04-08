import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'smtp.mailtrap.io'),
      port: this.configService.get<number>('MAIL_PORT', 587),
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, token: string): Promise<void> {
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
    const from = this.configService.get('MAIL_FROM', 'noreply@owkaz.com');

    await this.transporter.sendMail({
      from: `"Owkaz Properties" <${from}>`,
      to,
      subject: 'Reset your Owkaz password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #1B3B6F;">Reset your password</h2>
          <p>You requested a password reset for your Owkaz account.</p>
          <p>Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:24px 0;padding:12px 28px;background:#2A9D8F;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#666;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#999;font-size:12px;">Owkaz Properties &mdash; Nigeria's premier real estate marketplace</p>
        </div>
      `,
    });

    this.logger.log(`Password reset email sent to ${to}`);
  }
}
