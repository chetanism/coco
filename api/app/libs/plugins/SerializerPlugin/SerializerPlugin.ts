import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { DateNormalizer } from './service/normalizer/DateNormalizer';
import { NormalizerServiceLocator } from './service/normalizer/NormalizerServiceLocator';
import { JSONSerializer } from './service/serializer/JSONSerializer';
import { SerializerServiceLocator } from './service/serializer/SerializerServiceLocator';
import { NormalizerService } from './service/NormalizerService';
import { SerializerService } from './service/SerializerService';

export class SerializerPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'serializer';
  }

  getDefaultConfig(): {} {
    return {
      defaultSerializer: 'json',
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: object) {
    const { decorators: { injectable } } = serviceContainer;

    injectable()(DateNormalizer);
    injectable()(NormalizerServiceLocator);

    injectable({ alias: 'serializer.json' })(JSONSerializer);
    injectable()(SerializerServiceLocator);

    injectable({
      dependsOn: [NormalizerServiceLocator],
    })(NormalizerService);

    injectable({
      async getDependenciesList(resolve) {
        return [
          config,
          await resolve(NormalizerService),
          await resolve(SerializerServiceLocator),
        ];
      },
    })(SerializerService);
  }
}
