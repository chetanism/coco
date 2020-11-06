import { FactoryName, isFactoryName, ServiceDecoratorOptions } from '../../../core/container';
import { AbstractApplicationMiddleware } from '../service/AbstractApplicationMiddleware';
import { AbstractController } from '../service/AbstractController';

export type ControllerOptions = ServiceDecoratorOptions & {
  route: string,
  middlewares?: FactoryName[],
  parent?: FactoryName,
}

export function controller(name: FactoryName, options?: ControllerOptions) {
  if (!isFactoryName(name)) {
    options = <ControllerOptions>(name || {});
    name = undefined;
  }

  return function(Klass) {
    const nameTyRegister = name || Klass;
  }
}
