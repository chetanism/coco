import { Kernel } from '../libs/core/kernel/Kernel';
import { CommandPlugin } from '../libs/plugins/CommandPlugin';
import appConfig from '../../config';
import { EventPlugin } from '../libs/plugins/EventPlugin/EventPlugin';

const kernel = new Kernel({
  debug: true,
  env: 'development',
  autoloadDirs: [
    `${__dirname}/commands`,
    `${__dirname}/eventListeners`,
  ],
});

kernel.addPlugin(new CommandPlugin());
kernel.addPlugin(new EventPlugin());

kernel.boot(appConfig);

export const { container, decorators: { injectable, inject, service } } = kernel.getContainer();

