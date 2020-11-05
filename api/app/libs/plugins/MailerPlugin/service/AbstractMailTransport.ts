import { SentMessageInfo, Transporter } from 'nodemailer';
import * as Mail from 'nodemailer/lib/mailer';
import { MailServiceOptions } from './MailService';

export abstract class AbstractMailTransport {
  protected transport: Transporter;
  protected constructor(protected readonly mailConfig: MailServiceOptions) {
  }

  async sendMail(mailOptions: Mail.Options): Promise<SentMessageInfo> {
    return new Promise((resolve, reject) => {
      this.transport.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email: ', err);
          reject(err);
        }
        resolve(info);
      });
    });
  }
}
