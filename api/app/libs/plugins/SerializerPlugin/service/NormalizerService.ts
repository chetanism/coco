import { SerializableGroups } from './SerializerService';
import { isSerializable } from '../decorators/serializable';
import { exposedOptionsKey } from '../key';
import { ExposeOptions } from '../decorators/expose';
import { NormalizerServiceLocator } from './normalizer/NormalizerServiceLocator';
import { AbstractNormalizer } from './normalizer/AbstractNormalizer';

export type NormalizeOptions = {
  groups?: SerializableGroups
}

export type NormalizableNormalizeOptions = {
  groups: SerializableGroups[]
}

export class NormalizerService {
  constructor(private readonly  normalizerServiceLocator: NormalizerServiceLocator) {
  }

  public async normalize(value: any | any[], {
    groups = [],
  }: NormalizeOptions = {}, exposeOptions?: ExposeOptions): Promise<any> {
    if (Array.isArray(value)) {
      // normalize each element with the same passed groups
      return {
        type: 'array',
        normalized: await Promise.all(value.map((v) => this.normalize(v, { groups }, exposeOptions))),
        original: value,
      };
    } else if (value === null || value === undefined) {
      return {
        type: 'value',
        normalized: value,
        original: value,
      };
    } else if (typeof value === 'object') {
      // could be serializable or not
      if (isSerializable(value)) {
        // process as serializable
        return await this.normalizeSerializable(value, { groups: <SerializableGroups[]>groups });
      } else {
        let customNormalizer: AbstractNormalizer;
        // an object, has custom normalizer e.g. DateTime i.e. third party class not marked with Serializable
        // has normalizer option specified while being exposed
        if (exposeOptions && exposeOptions.normalizer) {
          return this.customNormalization(value, exposeOptions.normalizer);
        } else if (customNormalizer = this.hasCustomNormalizer(value)) {
          // normalize with the custom normalizer
          return {
            type: 'custom',
            original: value,
            normalized: await customNormalizer.normalize(value),
          };
        } else {
          // simple object iterate on keys and use same passed groups to normalize each key
          const ret = {
            type: 'object',
            normalized: {},
            original: value,
          };
          for (const key of Reflect.ownKeys(value)) {
            ret.normalized[key] = await this.normalize(value[key], { groups });
          }
          return ret;
        }
      }
    } else {
      // not an array, not an object, most likely a scalar value, return as is
      return {
        type: 'value',
        normalized: value,
        original: value,
      };
    }
  }

  private async normalizeSerializable(value: any, options: NormalizableNormalizeOptions) {
    const result = {
      type: 'serializable',
      normalized: {},
      original: value,
    };

    const toNormalize = [];
    let childrenGroups = {};
    const childrenExposeOptions = {};

    // Collect all keys
    let keys = Reflect.ownKeys(value);
    let obj = value;
    while (obj.__proto__) {
      keys = [...keys, ...Reflect.ownKeys(obj.__proto__)];
      obj = obj.__proto__;
    }

    // collect keys that should always be normalized
    for (const key of keys) {
      if (typeof key === 'number') {
        continue;
      }
      const metadata = Reflect.getMetadata(exposedOptionsKey, value, key);
      childrenExposeOptions[key] = metadata;
      if (metadata) {
        const { groups } = metadata;
        if (groups.length === 0) {
          toNormalize.push(key);
        }
      }
    }

    // for each group
    for (const group of options.groups) {
      // if the group is string
      if (typeof group === 'string') {
        // pick all keys with the group
        for (const key of keys) {
          if (typeof key === 'number') {
            continue;
          }
          const metadata = Reflect.getMetadata(exposedOptionsKey, value, key);
          if (metadata) {
            const { groups } = metadata;
            if (groups.includes[group]) {
              toNormalize.push(key);
            }
          }
        }
      } else {
        // its the special group with all child groups
        childrenGroups = group;
      }
    }

    for (const key of toNormalize) {
      const childValue = value[key];
      result.normalized[key] = await this.normalize(childValue, { groups: childrenGroups[key] || [] });
    }

    return result;
  }

  private async customNormalization(value: any, normalizerAlias: string) {
    const normalizer: AbstractNormalizer = await this.normalizerServiceLocator.resolveByAlias(normalizerAlias);
    return {
      type: 'custom',
      normalized: await normalizer.normalize(value),
      original: value,
    };
  }

  private hasCustomNormalizer(value: object): AbstractNormalizer {
    const normalizers = this.normalizerServiceLocator.getSupportedServices();
    normalizers.forEach((normalizer: unknown) => {
      const n = <typeof AbstractNormalizer>normalizer;
      if (n.supports && n.supports(value)) {
        return n;
      }
    });
    return null;
  }
}
