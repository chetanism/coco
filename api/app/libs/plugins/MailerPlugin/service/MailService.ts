import { MailTransportServiceLocator } from './MailTransportServiceLocator';
import { AbstractMailTransport } from './AbstractMailTransport';
import * as Mail from 'nodemailer/lib/mailer';
import * as NMJsonTransport from 'nodemailer/lib/json-transport';
import * as NMStreamTransport from 'nodemailer/lib/stream-transport';

export interface SendMailOptions {
  transport?: string,
}

export type MailgunOptions = {
  apiKey: string,
  domain: string,
  proxy: string,
  host: string,
  protocol: 'https' | 'http',
  port: number
}

export type MailServiceOptions = {
  defaultTransport: string,
  defaultSender: string,
  transports: {
    json?: NMJsonTransport.Options,
    mailgun?: MailgunOptions,
    stream?: NMStreamTransport.Options
  }
}

export class MailService {
  constructor(
    private readonly mailConfig: MailServiceOptions,
    private readonly mailTransportServiceLocator: MailTransportServiceLocator,
  ) {
  }

  private async getTransport(type): Promise<AbstractMailTransport> {
    const transport = type || this.mailConfig.defaultTransport;
    return this.mailTransportServiceLocator.resolveByAlias(`mailer.transport.${transport}`);
  }

  async sendMail(mailOptions: Mail.Options, options: SendMailOptions = {}) {
    const transport = await this.getTransport(options.transport);
    await transport.sendMail({
      ...mailOptions,
      from: mailOptions.from || this.mailConfig.defaultSender,
    });
  }
}
