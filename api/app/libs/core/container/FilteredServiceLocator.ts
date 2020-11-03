import { FactoryName, FactoryOptions } from './Container';
import { ServiceLocator } from './ServiceLocator';

export abstract class FilteredServiceLocator extends ServiceLocator {
  abstract filter(name: FactoryName, options: FactoryOptions): boolean;

  getSupportedServices(): FactoryName[] {
    return this['_container'].filterFactories(this.filter.bind(this));
  }
}
