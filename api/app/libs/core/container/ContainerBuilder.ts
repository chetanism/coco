import { Container, FactoryName, FactoryOptions } from './Container';
import {
  ContainerDecoratorsBuilder,
  InjectableDecorator,
  InjectDecorator,
} from './ContainerDecoratorsBuilder';

export type ServiceAutoTagger = (name: FactoryName, options: FactoryOptions) => string[] | undefined;
export type ServiceContainer = {
  container: Container,
  decorators: {
    inject: InjectDecorator,
    injectable: InjectableDecorator
  }
}


export class ContainerBuilder {
  decoratorBuilder: ContainerDecoratorsBuilder = new ContainerDecoratorsBuilder();
  buildContainer(): ServiceContainer {
    const container = new Container();
    const decorators = this.decoratorBuilder.buildDecorators(container);
    return {
      container,
      decorators,
    };
  }
}
