import { FactoryName, FactoryOptions, FilteredServiceLocator } from '../../../core/container';
import { AbstractMailTransport } from './AbstractMailTransport';

export class MailTransportServiceLocator extends FilteredServiceLocator {
  filter(name: FactoryName, options: FactoryOptions): boolean {
    return this.isInstanceOf(name, AbstractMailTransport);
  }
}
