import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractController } from './AbstractController';

export class ControllerLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractController);
  }
}
