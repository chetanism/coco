import { Container } from './Container';
import {
  ContainerFactory,
  InjectableDecorator,
  InjectDecorator,
  ProviderDecorator,
  ServiceDecorator,
} from './ContainerFactory';

export * from './Container';
export * from './ContainerFactory';


export type ServiceContainer = {
  container: Container,
  service: ServiceDecorator,
  provider: ProviderDecorator,
  inject: InjectDecorator,
  injectable: InjectableDecorator
}

const containerFactory = new ContainerFactory();
const serviceContainer: ServiceContainer = containerFactory.build();

export { serviceContainer };
