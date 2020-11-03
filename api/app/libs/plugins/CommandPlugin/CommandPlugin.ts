import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { CommandServiceLocator } from './CommandServiceLocator';
import { CommandRunner } from './CommandRunner';

export class CommandPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'command';
  }

  registerServices(serviceContainer: ServiceContainer) {
    const { decorators: { service } } = serviceContainer;

    service()(CommandServiceLocator);

    service('cli.handler', {
      dependsOn: [CommandServiceLocator],
    })(CommandRunner);
  }
}
