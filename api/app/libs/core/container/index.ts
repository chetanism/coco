import { ContainerBuilder, ServiceContainer } from './ContainerBuilder';

export * from './Container';
export * from './ContainerBuilder';
export * from './ContainerDecoratorsBuilder';
export * from './ServiceLocator';
export * from './TaggedServiceLocator';
export * from './FilteredServiceLocator';

export const serviceContainer: ServiceContainer = new ContainerBuilder().buildContainer();

const {
  container,
  decorators: { inject, injectable },
} = serviceContainer;

export { container, injectable, inject };
