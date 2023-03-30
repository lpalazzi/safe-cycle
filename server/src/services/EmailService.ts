import { injectable } from 'tsyringe';
import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Email } from 'types';
import config from 'config';

@injectable()
export class EmailService {
  private transporter: Transporter<SMTPTransport.SentMessageInfo>;

  // private verifyEmail = async () => {
  //   await this.transporter.verify().catch(() => {
  //     console.log('Failed to verify email server.');
  //   });
  // };

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.contactEmail.host,
      port: config.contactEmail.port,
      secure: true,
      auth: {
        user: config.contactEmail.address,
        pass: config.contactEmail.password,
      },
    });
    // this.verifyEmail();
  }

  async sendEmail(email: Email) {
    const info = await this.transporter.sendMail({
      from: email.from,
      replyTo: email.replyTo,
      to: email.to,
      subject: email.subject,
      html: email.message,
    });
  }
}
