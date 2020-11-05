import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../../core/container';
import { AbstractSerializer } from './AbstractSerializer';

export class SerializerServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractSerializer);
  }
}
