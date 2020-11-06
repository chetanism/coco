import { Kernel } from '../libs/core/kernel/Kernel';
import { CommandPlugin } from '../libs/plugins/CommandPlugin';
import appConfig from '../config';
import { EventPlugin } from '../libs/plugins/EventPlugin/EventPlugin';
import { MailerPlugin } from '../libs/plugins/MailerPlugin/MailerPlugin';
import { SerializerPlugin } from '../libs/plugins/SerializerPlugin/SerializerPlugin';

const kernel = new Kernel({
  debug: true,
  env: 'development',
  autoloadDirs: [
    `${__dirname}/commands`,
    `${__dirname}/eventListeners`,
  ],
  config: appConfig,
});

kernel.addPlugin(new CommandPlugin());
kernel.addPlugin(new EventPlugin());
kernel.addPlugin(new MailerPlugin());
kernel.addPlugin(new SerializerPlugin());

kernel.boot(appConfig);

export const { container, decorators: { injectable, inject } } = kernel.getContainer();

