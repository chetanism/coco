import { FactoryName } from './Container';
import { ServiceLocator } from './ServiceLocator';

export abstract class TaggedServiceLocator extends ServiceLocator {
  constructor(private readonly tag: string) {
    super();
  }

  getSupportedServices(): FactoryName[] {
    return this['_container'].getTaggedFactories(this.tag);
  }
}
