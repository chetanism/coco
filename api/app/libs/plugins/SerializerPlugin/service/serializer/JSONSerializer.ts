import { AbstractSerializer } from './AbstractSerializer';

export class JSONSerializer extends AbstractSerializer {
  serialize(normalizedValue: any, options): object {
    if (normalizedValue.type === 'value' || normalizedValue.type === 'custom') {
      return normalizedValue.normalized;
    }

    if (normalizedValue.type === 'array') {
      return normalizedValue.normalized.map((n) => this.serialize(n, options));
    }

    if (normalizedValue.type === 'object' || normalizedValue.type === 'serializable') {
      return Reflect.ownKeys(normalizedValue.normalized).reduce((ret, key) => {
        ret[key] = this.serialize(normalizedValue.normalized[key], options);
        return ret;
      }, {});
    }
  }

  serializeToString(normalizedValue: any, options): string {
    return JSON.stringify(this.serialize(normalizedValue, options));
  }
}
