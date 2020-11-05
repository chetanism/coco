
export abstract class AbstractNormalizer {
  static supports(value: any): boolean {
    return false;
  };

  abstract normalize(value: any): any;
}

