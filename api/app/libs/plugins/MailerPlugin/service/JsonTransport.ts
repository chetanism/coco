import { createTransport, SentMessageInfo } from 'nodemailer';
import * as NMJsonTransport from 'nodemailer/lib/json-transport';
import { AbstractMailTransport } from './AbstractMailTransport';
import * as Mail from 'nodemailer/lib/mailer';
import { MailServiceOptions } from './MailService';

export class JsonTransport extends AbstractMailTransport {
  constructor(
    mailConfig: MailServiceOptions
  ) {
    super(mailConfig);
    const options: NMJsonTransport.Options = {
      jsonTransport: true,
      ...(this.mailConfig.transports.json),
    };
    this.transport = createTransport(options);
  }

  async sendMail(mailOptions: Mail.Options): Promise<SentMessageInfo> {
    const info = await super.sendMail(mailOptions);
    console.log(info);
  }
}
