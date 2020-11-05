export abstract class AbstractSerializer {
  abstract serialize(normalizedValue: any, options): object;
  abstract serializeToString(normalizedValue: any, options): string;
}
