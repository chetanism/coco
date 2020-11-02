import { ServiceLocator } from './ServiceLocator';

export type Type<A> = { new(...args: any[]): A };
export type ClassType = Type<any>;

export type Tags = Array<string>;
export type FactoryName = PropertyKey | ClassType;

export type ResolveFunction = (name: FactoryName) => Promise<any>;
export type FactoryFunction = (resolve?: ResolveFunction) => any | Promise<any>;
export type DecoratorFunction = (service: any, resolve?: ResolveFunction) => void | Promise<void>;

export type FactoryOptions = {
  factoryFunction: FactoryFunction,
  decoratorFunction?: DecoratorFunction,
  tags?: Tags,
}

export type ValueOptions = {
  value: any,
}

export type RegisterFactoryFunction = (name: FactoryName, options?: FactoryOptions) => void;
export type RegisterValueFunction = (name: FactoryName, options?: ValueOptions) => void;


export class Container {
  private factories = new Map;
  private values = new Map;

  factory: RegisterFactoryFunction = (name: FactoryName, options: FactoryOptions) => {
    this.register(name, options);
  };

  value: RegisterValueFunction = (name: FactoryName, options: ValueOptions) => {
    const { value } = options;
    const factoryOptions: FactoryOptions = {
      factoryFunction: () => value,
    };
    this.register(name, factoryOptions);
  };

  resolve: ResolveFunction = async (name: FactoryName) => {
    const factoryOptions = this.resolveFactory(name);

    if (!this.values.has(name)) {
      await this.buildValue(name, factoryOptions);
    }
    return this.values.get(name);
  };

  getTaggedFactories(tag: string): FactoryName[] {
    const matched = [];
    for (const [type, factory] of this.factories) {
      if (factory.tags && factory.tags.has(tag)) {
        matched.push(type);
      }
    }
    return matched;
  }

  private register(name: FactoryName, options: FactoryOptions): void {
    if (this.factories.has(name)) {
      throw new Error(`A factory with name ${name.toString()} is already registered`);
    }

    this.factories.set(name, {
      ...options,
      tags: new Set(options.tags || []),
    });
  };

  private resolveFactory(name: FactoryName): FactoryOptions {
    if (!this.factories.has(name)) {
      throw new Error(`Unknown service/value with name ${name.toString()} requested`);
    }

    return this.factories.get(name);
  };

  private async buildValue(name: FactoryName, factoryOptions: FactoryOptions) {
    const value = await factoryOptions.factoryFunction(this.resolve);
    if (value instanceof ServiceLocator) {
      value.container = this;
    }
    this.values.set(name, value);

    if (factoryOptions.decoratorFunction) {
      await factoryOptions.decoratorFunction(value, this.resolve);
    }
  }
}
