import 'reflect-metadata';
import { ClassType } from '../../../core/container';
import { exposedOptionsKey } from '../key';

export type ExposeOptions = {
  exposed: boolean,
  groups?: string[],
  normalizer?: string,
} | void;

export function expose(options: ExposeOptions = {
  exposed: true,
  groups: [],
}) {
  return function(classPrototype: InstanceType<ClassType>, name: string): void {
    Reflect.defineMetadata(
      exposedOptionsKey,
      options,
      classPrototype,
      name,
    );
  };
}
