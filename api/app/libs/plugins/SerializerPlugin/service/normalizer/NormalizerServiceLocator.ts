import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../../core/container';
import { AbstractNormalizer } from './AbstractNormalizer';

export class NormalizerServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractNormalizer);
  }
}
