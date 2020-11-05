import { ClassType } from '../../../core/container';
import { serializableKey } from '../key';

export type SerializableOptions = {
  serializable: boolean,
} | void;

export function serializable(options: SerializableOptions = {
  serializable: true,
}) {
  return function(constructor: ClassType): void {
    Reflect.defineMetadata(serializableKey, options, constructor);
  };
}

export function isSerializable(value) {
  if (typeof value !== 'object') {
    return false;
  }

  const serializableOptions = Reflect.getOwnMetadata(serializableKey, value.constructor) || {};
  return serializableOptions.serializable === true;
}
