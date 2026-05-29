import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST', 'smtp.ethereal.email'),
      port: this.configService.get('EMAIL_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER', ''),
        pass: this.configService.get('EMAIL_PASS', ''),
      },
    });
  }

  async sendPasswordEmail(
    to: string,
    name: string,
    password: string,
  ): Promise<void> {
    const from = this.configService.get(
      'EMAIL_FROM',
      'noreply@library-management.com',
    );

    await this.transporter.sendMail({
      from,
      to,
      subject: 'Your Author Account Has Been Created',
      html: `
        <h2>Welcome to Library Management System</h2>
        <p>Hi ${name},</p>
        <p>An author account has been created for you.</p>
        <p><strong>Email:</strong> ${to}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please log in and change your password after first login.</p>
      `,
    });
  }
}
