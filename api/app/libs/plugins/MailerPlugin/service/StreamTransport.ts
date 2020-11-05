import { createTransport, SentMessageInfo } from 'nodemailer';
import * as NMStreamTransport from 'nodemailer/lib/stream-transport';
import { AbstractMailTransport } from './AbstractMailTransport';
import * as Mail from 'nodemailer/lib/mailer';
import { Readable } from 'stream';
import { MailServiceOptions } from './MailService';

export class StreamTransport extends AbstractMailTransport {
  constructor(mailConfig: MailServiceOptions) {
    super(mailConfig);
    const options: NMStreamTransport.Options = {
      streamTransport: true,
      ...(this.mailConfig.transports.stream),
    };
    this.transport = createTransport(options);
  }

  async sendMail(mailOptions: Mail.Options): Promise<SentMessageInfo> {
    const info = <NMStreamTransport.SentMessageInfo>await super.sendMail(mailOptions);
    const message = <Readable>info.message;
    message.pipe(process.stdout);
  }
}
