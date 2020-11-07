import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractMiddleware } from '../middlewares/AbstractMiddleware';

export class MiddlewareServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractMiddleware);
  }
}

