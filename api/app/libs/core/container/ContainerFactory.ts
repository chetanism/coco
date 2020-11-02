import 'reflect-metadata';
import {
  ClassType,
  Container,
  DecoratorFunction,
  FactoryName,
  ResolveFunction,
  Tags,
} from './Container';

export type ServiceDecoratorOptions = {
  tags?: Tags,
  dependsOn?: FactoryName[],
  decoratorFunction?: DecoratorFunction,
}

export type ProviderDecoratorOptions = {
  tags?: Tags,
  decoratorFunction?: DecoratorFunction,
}

export type InjectableOptions = {
  tags?: Tags,
  decoratorFunction?: DecoratorFunction,
}

export type GetDependenciesFunction = (ResolveFunction) => any[] | Promise<any[]>;

export type InjectableDecorator =
  (name?: FactoryName | InjectableOptions, options?: InjectableOptions) => (ClassType) => void
export type InjectDecorator =
  (name: FactoryName) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export type ProviderDecorator =
  (
    type: FactoryName | GetDependenciesFunction,
    getDependencies?: GetDependenciesFunction | ProviderDecoratorOptions,
    options?: ProviderDecoratorOptions,
  ) => (ClassType) => void
export type ServiceDecorator =
  (type?: FactoryName | ServiceDecoratorOptions, options?: ServiceDecoratorOptions) => (ClassType) => void;

export abstract class AutoServiceTagging {
  abstract addTags(Klass: ClassType, type: FactoryName): string[]
}

export class ContainerFactory {
  autoTaggingServices: AutoServiceTagging[] = [];

  addAutoTagging(autoTagging: AutoServiceTagging) {
    this.autoTaggingServices.push(autoTagging);
  }

  build() {
    const container = new Container();
    const containerId = `c_${Math.random()}`;
    const service = this.buildServiceDecorator(container);
    const provider = this.buildProviderDecorator(container);
    const inject = this.buildInjectDecorator(containerId);
    const injectable = this.buildInjectableDecorator(container, containerId);

    return { container, service, provider, inject, injectable };
  }

  private getAutoTags(Klass: ClassType, type: FactoryName) {
    let tags = [];
    for (const autoTagging of this.autoTaggingServices) {
      const autoTags = autoTagging.addTags(Klass, type);
      tags = [...tags, ...autoTags];
    }
    return tags;
  }

  private buildInjectableDecorator(container: Container, containerId: string): InjectableDecorator {
    const key = `injections_${containerId}`;
    return (type?: FactoryName | InjectableOptions, options: InjectableOptions = {}) => {
      if (['string', 'number', 'symbol', 'function'].indexOf(typeof type) === -1) {
        options = <InjectableOptions>(type || {});
        type = undefined;
      }

      const { tags = [], decoratorFunction } = options;

      return (Klass) => {
        const typeToRegister = type === undefined ? Klass : type;
        const autoTags = this.getAutoTags(Klass, typeToRegister);

        container.factory(typeToRegister, {
          tags: [...tags, ...autoTags],
          decoratorFunction,
          factoryFunction: async (resolve: ResolveFunction) => {
            const injections = Reflect.getOwnMetadata(key, Klass) || [];
            const dependsOnList = injections.sort((i1, i2) => i1.index - i2.index);
            const dependencies = await Promise.all(dependsOnList.map((d) => {
              return resolve(d.type);
            }));
            return new Klass(...dependencies);
          },
        });
      };
    };
  }

  private buildInjectDecorator(containerId: string): InjectDecorator {
    const key = `injections_${containerId}`;
    return function inject(type: FactoryName) {
      return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingInjections = Reflect.getOwnMetadata(key, target, propertyKey) || [];
        existingInjections.push({
          index: parameterIndex,
          type,
        });
        Reflect.defineMetadata(key, existingInjections, target, propertyKey);
      };
    };
  }

  private buildProviderDecorator(container: Container): ProviderDecorator {
    return (
      type: FactoryName | GetDependenciesFunction,
      getDependencies?: GetDependenciesFunction | ProviderDecoratorOptions,
      options?: ProviderDecoratorOptions,
    ) => {
      if (['string', 'number', 'symbol'].indexOf(typeof type) === -1) {
        if (typeof type === 'function') {
          options = <ProviderDecoratorOptions>(getDependencies || {});
          getDependencies = <GetDependenciesFunction>type;
          type = undefined;
        } else {
          throw new Error('You need to provide the getDependencies function while using `provider`. You are otherwise better off with `service` or `injectable`');
        }
      } else if (typeof getDependencies !== 'function') {
        throw new Error('You need to provide the getDependencies function while using `provider`. You are otherwise better off with `service` or `injectable`');
      }

      const _getDependencies = <GetDependenciesFunction>getDependencies;

      const { decoratorFunction, tags = [] } = options || {};
      return (Klass) => {
        const typeToRegister = type === undefined ? Klass : type;
        const autoTags = this.getAutoTags(Klass, typeToRegister);

        container.factory(typeToRegister, {
          factoryFunction: async (resolve: ResolveFunction) => {
            const dependencies = await _getDependencies(resolve);
            if (!Array.isArray(dependencies)) {
              throw new Error(`The provider\'s 'getDependencies' function for class ${Klass} has not returned an array.`);
            }
            return new Klass(...dependencies);
          },
          decoratorFunction,
          tags: [...tags, ...autoTags],
        });
      };
    };
  }

  private buildServiceDecorator(container: Container) {
    return (type?: FactoryName | ServiceDecoratorOptions, options: ServiceDecoratorOptions = {}) => {
      if (['string', 'number', 'symbol', 'function'].indexOf(typeof type) === -1) {
        options = <ServiceDecoratorOptions>(type || {});
        type = undefined;
      }

      const { decoratorFunction, tags = [], dependsOn = [] } = options;
      return (Klass) => {
        const typeToRegister = type === undefined ? Klass : type;
        const autoTags = this.getAutoTags(Klass, typeToRegister);

        container.factory(typeToRegister, {
          factoryFunction: async (resolve: ResolveFunction) => {
            const dependencies = await Promise.all(dependsOn.map((type) => {
              return resolve(type);
            }));
            return new Klass(...dependencies);
          },
          decoratorFunction,
          tags: [...tags, ...autoTags],
        });
      };
    };
  }
}
