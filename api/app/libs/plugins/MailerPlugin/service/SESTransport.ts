import { AbstractMailTransport } from './AbstractMailTransport';
import { MailServiceOptions } from './MailService';
import { createTransport } from 'nodemailer';
import { SES } from 'aws-sdk';

export class SESTransport extends AbstractMailTransport {
  constructor(mailConfig: MailServiceOptions) {
    super(mailConfig);
    this.transport = createTransport({
      SES: new SES({
        apiVersion: '2010-12-01'
      })
    })
  }
}
