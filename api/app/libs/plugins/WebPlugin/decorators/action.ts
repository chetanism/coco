import 'reflect-metadata';
import { FactoryName } from '../../../core/container';

export type ActionOptions = {
  route: string,
  methods?: ('get' | 'post' | 'put' | 'delete' | 'options')[],
  name?: string,
  middlewares?: FactoryName[]
}

export const ActionKey = Symbol('Action');

export function action(options: ActionOptions) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const definedActions = Reflect.getOwnMetadata(ActionKey, target) || [];
    definedActions.push({
      propertyKey,
      options,
    });
    Reflect.defineMetadata(ActionKey, definedActions, target);
  };
}
