import 'reflect-metadata';
import { Container, DecoratorFunction, FactoryFunction, FactoryType, Labels, ResolveFunction, Tags } from './Container';

export type DependsOn = FactoryType | {
  type: FactoryType,
  tags?: Tags,
}

export type ServiceDecoratorOptions = {
  tags?: Tags,
  labels?: Labels,
  dependsOn?: DependsOn[],
  decoratorFunction?: DecoratorFunction,
}

export type ProviderDecoratorOptions = {
  tags?: Tags,
  labels?: Labels,
  decoratorFunction?: DecoratorFunction,
}

export type InjectableOptions = {
  tags?: Tags,
  labels?: Labels,
  decoratorFunction?: DecoratorFunction,
}

export type GetDependenciesFunction = (ResolveFunction) => any[] | Promise<any[]>;

export class ContainerFactory {
  build() {
    const container = new Container();
    const containerId = `c_${Math.random()}`;
    container.value('container', { value: container });
    const service = this.buildServiceDecorator(container);
    const provider = this.buildProviderDecorator(container);
    const inject = this.buildInjectDecorator(containerId);
    const injectable = this.buildInjectableDecorator(container, containerId);

    return { container, service, provider, inject, injectable };
  }

  private buildInjectableDecorator(container: Container, containerId: string) {
    const key = `injections_${containerId}`;
    return function injectable(type?: FactoryType | InjectableOptions, options: InjectableOptions = {}) {
      if (['string', 'number', 'symbol', 'function'].indexOf(typeof type) === -1) {
        options = <InjectableOptions>(type || {});
        type = undefined;
      }

      const { tags, labels, decoratorFunction } = options;
      return function decorator(Klass) {
        container.factory(type === undefined ? Klass : type, {
          tags,
          labels,
          decoratorFunction,
          factoryFunction: async (resolve: ResolveFunction) => {
            const injections = Reflect.getOwnMetadata(key, Klass) || [];
            const dependsOnList = injections.sort((i1, i2) => i1.index - i2.index);
            const dependencies = await Promise.all(dependsOnList.map((d) => {
              const { type, tags } = d;
              return resolve(type, tags);
            }));
            return new Klass(...dependencies);
          },
        });
      };
    };
  }

  private buildInjectDecorator(containerId: string) {
    const key = `injections_${containerId}`;
    return function inject(type: FactoryType, tags?: Tags) {
      return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingInjections = Reflect.getOwnMetadata(key, target, propertyKey) || [];
        existingInjections.push({
          index: parameterIndex,
          type,
          tags,
        });
        Reflect.defineMetadata(key, existingInjections, target, propertyKey);
      };
    };
  }

  private buildProviderDecorator(container: Container) {
    return function provider(
      type?: FactoryType | GetDependenciesFunction,
      getDependencies?: GetDependenciesFunction | ProviderDecoratorOptions,
      options: ProviderDecoratorOptions = {},
    ) {
      if (['string', 'number', 'symbol'].indexOf(typeof type) === -1) {
        if (typeof type === 'function') {
          options = <ProviderDecoratorOptions>(getDependencies || {});
          getDependencies = <GetDependenciesFunction>type;
          type = undefined;
        } else {
          throw new Error('You need to provide the getDependencies function while using `provider`. You are otherwise better off with `service` or `injectable`')
        }
      }

      const _getDependencies = <GetDependenciesFunction>getDependencies;

      const { decoratorFunction, labels, tags } = options;
      return function decorator(Klass) {
        container.factory(type === undefined ? Klass : type, {
          factoryFunction: async (resolve: ResolveFunction) => {
            const dependencies = await _getDependencies(resolve);
            if (!Array.isArray(dependencies)) {
              throw new Error(`The provider\'s 'getDependencies' function for class ${Klass} has not returned an array.`)
            }
            return new Klass(...dependencies);
          },
          decoratorFunction,
          labels,
          tags,
        });
      };
    };
  }

  private buildServiceDecorator(container: Container) {
    return function service(type?: FactoryType | ServiceDecoratorOptions, options: ServiceDecoratorOptions = {}) {
      if (['string', 'number', 'symbol', 'function'].indexOf(typeof type) === -1) {
        options = <ServiceDecoratorOptions>(type || {});
        type = undefined;
      }

      const { decoratorFunction, labels, tags, dependsOn = [] } = options;
      return function decorator(Klass) {
        container.factory(type === undefined ? Klass : type, {
          factoryFunction: async (resolve: ResolveFunction) => {
            const dependsOnList = dependsOn.map((d) => typeof d === 'object' ? d : { type: d });
            const dependencies = await Promise.all(dependsOnList.map((d) => {
              const { type, tags } = d;
              return resolve(type, tags);
            }));
            return new Klass(...dependencies);
          },
          decoratorFunction,
          labels,
          tags,
        });
      };
    };
  }
}
