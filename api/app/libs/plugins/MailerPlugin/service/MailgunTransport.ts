import { AbstractMailTransport } from './AbstractMailTransport';
import * as mailgun from 'nodemailer-mailgun-transport';
import { createTransport } from 'nodemailer';
import { MailServiceOptions } from './MailService';

export class MailgunTransport extends AbstractMailTransport {
  constructor(mailConfig: MailServiceOptions) {
    super(mailConfig);
    this.transport = createTransport(mailgun(mailConfig.transports.mailgun));
  }
}
