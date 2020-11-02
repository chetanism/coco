import { AutoServiceTagging, ContainerFactory, ServiceContainer } from '../../core/container';

abstract class Plugin {
  getDefaultNamespace() {
    return 'testPlugin'
  }

  loadDefaultConfig(configLoader) {
    return {};
  }

  getConfigValidator() {
    return {};
  }

  getAutoTagging(config): AutoServiceTagging[] {
    return [];
  };

  loadServices(config, container: ServiceContainer) {
  }
}
