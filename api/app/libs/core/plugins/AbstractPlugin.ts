import { ServiceAutoTagger, ServiceContainer } from '../container';

export abstract class AbstractPlugin {
  abstract getDefaultNamespace();

  getDefaultConfig() {
    return {};
  }

  registerServices(serviceContainer: ServiceContainer, config: object): void {

  }
}
