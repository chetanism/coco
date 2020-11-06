import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';

export class ApplicationMiddlewareServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractApplicationMiddleware);
  }
}
