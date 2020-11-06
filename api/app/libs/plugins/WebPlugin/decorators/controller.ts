import 'reflect-metadata';
import {
  FactoryName,
  isFactoryName,
  InjectableOptions,
  ClassType,
  InjectableDecorator,
} from '../../../core/container';


export type ControllerOptions = InjectableOptions & {
  route: string,
  middlewares?: FactoryName[],
  parent?: FactoryName,
}

export type HasInjectable = {
  injectable: InjectableDecorator
}


export type ControllerDecorator =
  HasInjectable & ((name: FactoryName | ControllerOptions, options?: ControllerOptions) => (Klass: ClassType) => void)

export const ControllerKey = Symbol('Controller');

export const controller: ControllerDecorator = (name: FactoryName, options?: ControllerOptions) => {
  if (!isFactoryName(name)) {
    options = <ControllerOptions>(name || {});
    name = undefined;
  }

  return function(Klass) {
    const { route, middlewares, parent, ...restOptions } = options;

    if (!controller.injectable) {
      throw new Error('Trying to register a controller even before plugins are loaded?');
    }

    controller.injectable(name, restOptions)(Klass);

    Reflect.defineMetadata(ControllerKey, { route, middlewares, parent }, Klass);
  };
};

controller.injectable = null;
