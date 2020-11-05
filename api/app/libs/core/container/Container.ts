import { ServiceLocator } from './ServiceLocator';

export type Type<A> = { new(...args: any[]): A };
export type ClassType = Type<any>;

export type Tags = Array<string>;
export type FactoryName = PropertyKey | ClassType;

export type ResolveFunction = (name: FactoryName) => Promise<any>;
export type FactoryFunction = (resolve?: ResolveFunction) => any | Promise<any>;
export type DecoratorFunction = (service: any, resolve?: ResolveFunction) => void | Promise<void>;
export type FilterFactoryFunction = (name: FactoryName, options: FactoryOptions) => boolean;

export type FactoryOptions = {
  factoryFunction: FactoryFunction,
  decoratorFunction?: DecoratorFunction,
  tags?: Tags,
  alias?: string,
}

export type ValueOptions = {
  value: any,
}

export type RegisterFactoryFunction = (name: FactoryName, options?: FactoryOptions) => void;
export type RegisterValueFunction = (name: FactoryName, options?: ValueOptions) => void;

// export type AutoTagHook = (name: FactoryName, options: FactoryOptions) => string[] | void;

export class Container {
  private factories = new Map;
  private values = new Map;
  private aliasValues: Map<string, any> = new Map;

  private globalPausePromise = Promise.resolve();

  pauseFor(promise) {
    this.globalPausePromise = this.globalPausePromise.then(() => promise);
  }

  // private autoTagHooks = new Map;

  // addAutoTagHook(registerHook: AutoTagHook) {
  //   this.autoTagHooks.set(registerHook, registerHook);
  //   return () => this.autoTagHooks.delete(registerHook);
  // }

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
    await this.globalPausePromise;
    const factoryOptions = this.resolveFactory(name);

    if (!this.values.has(name)) {
      await this.buildValue(name, factoryOptions);
    }
    return this.values.get(name);
  };

  resolveByAlias: ResolveFunction = async (alias: string) => {
    await this.globalPausePromise;
    const [name, factoryOptions]: [FactoryName, FactoryOptions] = this.resolveFactoryByAlias(alias);

    if (!this.aliasValues.has(alias)) {
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

  filterFactories(filter: FilterFactoryFunction): FactoryName[] {
    return Array.from(this.factories.entries())
      .filter(([name, options]) => filter(name, options))
      .map(([name]) => name);
  }

  private register(name: FactoryName, options: FactoryOptions): void {
    if (this.factories.has(name)) {
      throw new Error(`A factory with name ${name.toString()} is already registered`);
    }

    // for (const hook of this.autoTagHooks.values()) {
    //   const tags = hook(name, { ...options }) || [];
    //   options.tags = [...(options.tags || []), ...tags];
    // }

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

  private resolveFactoryByAlias(alias: string): [FactoryName, FactoryOptions] {
    for (const [name, factoryOptions] of this.factories) {
      if (factoryOptions.alias === alias) {
        return [name, factoryOptions];
      }
    }

    throw new Error(`Unknown service/value with alias ${alias} requested`);
  };

  private async buildValue(name: FactoryName, factoryOptions: FactoryOptions) {
    const value = await factoryOptions.factoryFunction(this.resolve);
    if (value instanceof ServiceLocator) {
      value.container = this;
    }

    this.values.set(name, value);

    const { alias } = factoryOptions;
    if (alias) {
      if (this.aliasValues.has(alias)) {
        throw new Error(`There is already a factory registered with alias: ${alias}`);
      }

      this.aliasValues.set(alias, value);
    }

    if (factoryOptions.decoratorFunction) {
      await factoryOptions.decoratorFunction(value, this.resolve);
    }
  }
}
