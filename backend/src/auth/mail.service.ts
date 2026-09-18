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

  async sendContactMessage(dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<void> {
    const adminEmail = this.configService.get('MAIL_FROM', 'noreply@owkaz.com');
    const from = adminEmail;
    const subject = dto.subject ? `[Owkaz Contact] ${dto.subject}` : '[Owkaz Contact] New Message';

    // Notify admin
    await this.transporter.sendMail({
      from: `"Owkaz Contact Form" <${from}>`,
      to: adminEmail,
      replyTo: dto.email,
      subject,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0B2540;border-bottom:2px solid #C8882A;padding-bottom:12px;">New Contact Form Message</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:120px;">Name</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#111827;">${dto.firstName} ${dto.lastName}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${dto.email}" style="color:#0E7C6E;">${dto.email}</a></td></tr>
            ${dto.phone ? `<tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Phone</td><td style="padding:8px 0;font-size:13px;"><a href="tel:${dto.phone}" style="color:#0E7C6E;">${dto.phone}</a></td></tr>` : ''}
            ${dto.subject ? `<tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Subject</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#111827;">${dto.subject}</td></tr>` : ''}
          </table>
          <div style="background:#F7F3ED;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;color:#6B7280;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Message</p>
            <p style="font-size:14px;color:#111827;line-height:1.7;margin:0;">${dto.message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="font-size:12px;color:#9CA3AF;">Reply directly to this email to respond to ${dto.firstName}.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="font-size:12px;color:#9CA3AF;">Owkaz Properties &mdash; Nigeria's premier real estate marketplace</p>
        </div>
      `,
    });

    // Send confirmation to the sender
    await this.transporter.sendMail({
      from: `"Owkaz Properties" <${from}>`,
      to: dto.email,
      subject: 'Owkaz: We received your message',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0B2540;">Hi ${dto.firstName},</h2>
          <p style="color:#6B7280;font-size:14px;line-height:1.7;">Thank you for reaching out to Owkaz Properties. We've received your message and will get back to you within <strong>24 hours</strong>.</p>
          <div style="background:#F7F3ED;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="font-size:12px;color:#6B7280;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Your message</p>
            <p style="font-size:13px;color:#111827;line-height:1.6;margin:0;">${dto.message.replace(/\n/g, '<br>')}</p>
          </div>
          <p style="color:#6B7280;font-size:13px;">If you need urgent assistance, call us at <strong>+234 (0) 800 OWKAZ 01</strong> or WhatsApp <strong>+234 (0) 901 000 0000</strong>.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#9CA3AF;font-size:12px;">Owkaz Properties &mdash; Nigeria's premier real estate marketplace</p>
        </div>
      `,
    });

    this.logger.log(`Contact form submission from ${dto.email}`);
  }

  async sendInquiryConfirmationToBuyer(dto: {
    to: string;
    buyerName: string;
    propertyTitle: string;
    message: string;
  }): Promise<void> {
    const from = this.configService.get('MAIL_FROM', 'noreply@owkaz.com');
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');

    await this.transporter.sendMail({
      from: `"Owkaz Properties" <${from}>`,
      to: dto.to,
      subject: `Owkaz: We received your enquiry about "${dto.propertyTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2 style="color:#0B2540;">Hi ${dto.buyerName},</h2>
          <p style="color:#6B7280;font-size:14px;line-height:1.7;">Thanks for your interest in <strong>${dto.propertyTitle}</strong>. We've received your enquiry and an Owkaz representative will follow up shortly.</p>
          <div style="background:#F7F3ED;border-radius:8px;padding:16px;margin:20px 0;">
            <p style="font-size:12px;color:#6B7280;margin:0 0 6px;font-weight:600;text-transform:uppercase;">Your message</p>
            <p style="font-size:13px;color:#111827;line-height:1.6;margin:0;">${dto.message.replace(/\n/g, '<br>')}</p>
          </div>
          <a href="${frontendUrl}/my-inquiries"
             style="display:inline-block;margin:8px 0 24px;padding:12px 28px;background:#2A9D8F;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            View Conversation
          </a>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
          <p style="color:#9CA3AF;font-size:12px;">Owkaz Properties &mdash; Nigeria's premier real estate marketplace</p>
        </div>
      `,
    });

    this.logger.log(`Inquiry confirmation email sent to buyer ${dto.to}`);
  }

  async sendNewInquiryAlertToAdmin(dto: {
    to: string;
    buyerName: string;
    buyerEmail: string;
    propertyTitle: string;
    message: string;
    inquiryId: string;
  }): Promise<void> {
    const from = this.configService.get('MAIL_FROM', 'noreply@owkaz.com');
    const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:5173');

    await this.transporter.sendMail({
      from: `"Owkaz Properties" <${from}>`,
      to: dto.to,
      replyTo: dto.buyerEmail,
      subject: `New enquiry: "${dto.propertyTitle}"`,
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
          <h2 style="color:#0B2540;border-bottom:2px solid #C8882A;padding-bottom:12px;">New Property Enquiry</h2>
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:120px;">Property</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#111827;">${dto.propertyTitle}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Buyer</td><td style="padding:8px 0;font-size:13px;font-weight:600;color:#111827;">${dto.buyerName}</td></tr>
            <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${dto.buyerEmail}" style="color:#0E7C6E;">${dto.buyerEmail}</a></td></tr>
          </table>
          <div style="background:#F7F3ED;border-radius:8px;padding:20px;margin-bottom:24px;">
            <p style="font-size:13px;color:#6B7280;margin:0 0 8px;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Message</p>
            <p style="font-size:14px;color:#111827;line-height:1.7;margin:0;">${dto.message.replace(/\n/g, '<br>')}</p>
          </div>
          <a href="${frontendUrl}/dashboard/inquiries"
             style="display:inline-block;margin-bottom:24px;padding:12px 28px;background:#2A9D8F;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Open in Dashboard
          </a>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0;" />
          <p style="font-size:12px;color:#9CA3AF;">Owkaz Properties &mdash; Nigeria's premier real estate marketplace</p>
        </div>
      `,
    });

    this.logger.log(`New inquiry (${dto.inquiryId}) alert emailed to admin ${dto.to}`);
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
