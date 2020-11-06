import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';

export class WebPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'web';
  }

  getDefaultConfig(): {} {
    return {};
  }

  registerServices(serviceContainer: ServiceContainer, config: object) {
    super.registerServices(serviceContainer, config);
  }
}
