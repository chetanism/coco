import { AbstractNormalizer } from './AbstractNormalizer';

export class DateNormalizer extends AbstractNormalizer {
  normalize(value: Date): any {
    return value.toISOString();

  }

  static supports(value: any) {
    return value instanceof Date;
  }
}
