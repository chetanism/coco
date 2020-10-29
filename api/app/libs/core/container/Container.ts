export type Type<A> = { new(...args: any[]): A };
export type ClassType = Type<any>;

export type Tags = { [tag: string]: string | number };
export type Labels = Array<string>;
export type FactoryType = PropertyKey | ClassType;

export type ResolveFunction = (type: FactoryType, tags?: Tags) => Promise<any>;
export type FactoryFunction = (resolve?: ResolveFunction) => any | Promise<any>;
export type DecoratorFunction = (value: any, resolve?: ResolveFunction) => void | Promise<void>;

export type FactoryOptions = {
  factoryFunction: FactoryFunction,
  decoratorFunction?: DecoratorFunction,
  labels?: Labels,
  tags?: Tags,
  tagsKey?: string,
}

export type ValueOptions = {
  value: any,
  tags?: Tags,
}

export type RegisterFactoryFunction = (type: FactoryType, options?: FactoryOptions) => void;
export type RegisterValueFunction = (type: FactoryType, options?: ValueOptions) => void;


export class Container {
  private factories = new Map;
  private values = new Map;

  factory: RegisterFactoryFunction = (type: FactoryType, options: FactoryOptions) => {
    this.register(type, options);
  };

  value: RegisterValueFunction = (name: FactoryType, options: ValueOptions) => {
    const { value, tags } = options;
    const factoryOptions: FactoryOptions = {
      factoryFunction: () => value,
      tags,
    };
    this.register(name, factoryOptions);
  };

  resolve: ResolveFunction = async (type: FactoryType, tags?: Tags) => {
    const factoryOptions = this.resolveFactory(type, tags);
    const { tagsKey } = factoryOptions;

    if (!this.values.get(type) || !this.values.get(type)[tagsKey]) {
      await this.buildValue(tagsKey, type, factoryOptions);
    }

    return this.values.get(type)[tagsKey];
  };

  checkSanity = () => {
    for (const [type, factories] of this.factories) {
      const tagsKeys = factories.map((fo: FactoryOptions) => fo.tagsKey).sort();
      for (let i = 0; i < tagsKeys.length - 1; i++) {
        if (tagsKeys[i] === tagsKeys[i + 1]) {
          throw new Error(`Multiple factories for type ${type.toString()} registered with same tags ${tagsKeys}`);
        }
      }
    }
  };

  private register(type: FactoryType, options: FactoryOptions): void {
    if (!this.factories.has(type)) {
      this.factories.set(type, []);
    }
    this.factories.get(type).push({
      ...options,
      tagsKey: this.buildTagsKey(options.tags),
    });
  };

  private buildTagsKey(tags: Tags = {}): string {
    return <string>Reflect.ownKeys(tags).sort().reduce((tagKey: string, tagName: string) => {
      return `${tagKey}_${tagName}_${tags[tagName]}`;
    }, '');
  }

  private resolveFactory(type: FactoryType, tags: Tags = {}): FactoryOptions {
    const tagsKey = this.buildTagsKey(tags);
    const typeFactories = this.factories.get(type) || [];
    const matched = typeFactories.filter((factoryOptions: FactoryOptions) => factoryOptions.tagsKey === tagsKey);

    if (matched.length === 0) {
      throw new Error(`Could not find any instance of type ${type.toString()} with provided set of tags: ${JSON.stringify(tags)}`);
    } else if (matched.length > 1) {
      throw new Error(`Found more than one matching instances of type ${type.toString()} with provided set of tags: ${JSON.stringify(tags)}`);
    }

    return matched[0];
  };

  private async buildValue(valueName: string, type: FactoryType, factoryOptions: FactoryOptions) {
    if (!this.values.has(type)) {
      this.values.set(type, {});
    }
    this.values.get(type)[valueName] = await factoryOptions.factoryFunction(this.resolve);
    if (factoryOptions.decoratorFunction) {
      await factoryOptions.decoratorFunction(this.values.get(type)[valueName], this.resolve);
    }
  }
}
