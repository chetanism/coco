import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { MailService, MailServiceOptions } from './service/MailService';
import { JsonTransport } from './service/JsonTransport';
import { MailgunTransport } from './service/MailgunTransport';
import { StreamTransport } from './service/StreamTransport';
import { SESTransport } from './service/SESTransport';
import { MailTransportServiceLocator } from './service/MailTransportServiceLocator';

export class MailerPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'mailer';
  }

  getDefaultConfig(): {} {
    return {
      defaultTransport: 'json',
      defaultSender: 'noreply@example.com',
      transports: {
        json: {},
        stream: {},
      },
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: MailServiceOptions) {
    const { decorators: { service } } = serviceContainer;

    service({ getDependencies: () => [config], alias: 'mailer.transport.json' })(JsonTransport);
    service({ getDependencies: () => [config], alias: 'mailer.transport.mailgun' })(MailgunTransport);
    service({ getDependencies: () => [config], alias: 'mailer.transport.stream' })(StreamTransport);
    service({ getDependencies: () => [config], alias: 'mailer.transport.ses' })(SESTransport);

    service()(MailTransportServiceLocator);
    service({
      getDependencies: async (resolve) => [config, await resolve(MailTransportServiceLocator)],
    })(MailService);
  }
}
