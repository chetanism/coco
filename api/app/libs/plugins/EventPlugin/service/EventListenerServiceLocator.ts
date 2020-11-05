import { FactoryName, FilteredServiceLocator } from '../../../core/container';
import { AbstractEventListener } from './AbstractEventListener';

export class EventListenerServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName): boolean {
    return typeof name === 'function' && name.prototype instanceof AbstractEventListener;
  }
}
