import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { EventDispatcher } from './service/EventDispatcher';
import { EventListenerServiceLocator } from './service/EventListenerServiceLocator';

export class EventPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'events';
  }

  registerServices(serviceContainer: ServiceContainer, config: object) {
    const { decorators: { service } } = serviceContainer;

    service()(EventListenerServiceLocator);

    service({
      dependsOn: [EventListenerServiceLocator]
    })(EventDispatcher);
  }
}
