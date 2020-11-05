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
    const { decorators: { service } } = serviceContainer;

    service()(DateNormalizer);
    service()(NormalizerServiceLocator);

    service({ alias: 'serializer.json' })(JSONSerializer);
    service()(SerializerServiceLocator);

    service({
      dependsOn: [NormalizerServiceLocator],
    })(NormalizerService);

    service({
      async getDependencies(resolve) {
        return [
          config,
          await resolve(NormalizerService),
          await resolve(SerializerServiceLocator),
        ];
      },
    })(SerializerService);
  }
}
