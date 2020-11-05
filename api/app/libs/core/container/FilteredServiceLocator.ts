import { FactoryName, FactoryOptions } from './Container';
import { ServiceLocator } from './ServiceLocator';

export abstract class FilteredServiceLocator extends ServiceLocator {
  abstract filter(name: FactoryName, options: FactoryOptions): boolean;

  protected isStringName(name: FactoryName) {
    return typeof name === 'string';
  }

  protected isInstanceOf(name, Klass) {
    return typeof name === 'function' && name.prototype instanceof Klass;
  }

  getSupportedServices(): FactoryName[] {
    return this['_container'].filterFactories(this.filter.bind(this));
  }
}
