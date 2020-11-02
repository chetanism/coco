import { ContainerFactory } from './container';
import { CommandServiceAutoTagging, CommandServiceLocator, CommandRunner } from './commands';

const containerBuilder = new ContainerFactory();
const { container, inject, injectable, service, provider } = containerBuilder.build();

const commandAutoTagging = new CommandServiceAutoTagging();
containerBuilder.addAutoTagging(commandAutoTagging);

const commandServiceLocator = new CommandServiceLocator();
commandServiceLocator.container = container;
const commandRunner = new CommandRunner(commandServiceLocator);

export {
  container, injectable, inject, service, provider, containerBuilder,
  commandRunner,
};
