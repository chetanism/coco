import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { CommandServiceLocator } from './service/CommandServiceLocator';
import { CommandRunner } from './service/CommandRunner';

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
