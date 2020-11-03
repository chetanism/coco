import 'reflect-metadata';
import { ClassType, Container, DecoratorFunction, FactoryName, ResolveFunction, Tags } from './Container';


export type GetDependenciesFunction = (ResolveFunction) => any[] | Promise<any[]>;
export type InjectableGetDependenciesFunction =
  (ResolveFunction) => { [key: number]: any } | Promise<{ [key: number]: any }>;

export type ServiceDecoratorOptions = {
  tags?: Tags,
  dependsOn?: FactoryName[],
  decoratorFunction?: DecoratorFunction,
  getDependencies?: GetDependenciesFunction,
}

export type InjectableOptions = {
  tags?: Tags,
  decoratorFunction?: DecoratorFunction,
  getDependencies?: InjectableGetDependenciesFunction,
}

export type InjectableDecorator =
  (name?: FactoryName | InjectableOptions, options?: InjectableOptions) => (ClassType) => void
export type InjectDecorator =
  (name: FactoryName) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
export type ServiceDecorator =
  (name?: FactoryName | ServiceDecoratorOptions, options?: ServiceDecoratorOptions) => (ClassType) => void;

export type ContainerDecorators = {
  injectable: InjectableDecorator,
  inject: InjectDecorator
  service: ServiceDecorator,
}

function isFactoryName(value: FactoryName | ServiceDecoratorOptions | InjectableOptions) {
  return ['string', 'number', 'symbol', 'function'].includes(typeof value);
}

function toInteger(name, value: any): number {
  let i: any = '';
  i = parseInt(value);
  if (i.toString() === value) {
    return i;
  }

  throw new Error(`The getDependencies function provided as part of the injectable decorator on ${name.toString()} must return an object with integer indexes it used ${value}`);
}


export class ContainerDecoratorsBuilder {
  buildDecorators(container: Container): ContainerDecorators {
    const containerId = Symbol('Container');
    return {
      inject: this.buildInjectDecorator(containerId),
      injectable: this.buildInjectableDecorator(container, containerId),
      service: this.buildServiceDecorator(container),
    };
  }

  private buildServiceDecorator(container: Container) {
    return (name?: FactoryName | ServiceDecoratorOptions, options: ServiceDecoratorOptions = {}) => {
      if (!isFactoryName(name)) {
        options = <ServiceDecoratorOptions>(name || {});
        name = undefined;
      }

      const { decoratorFunction, tags = [], dependsOn = [], getDependencies } = options;

      const dependenciesGetter: GetDependenciesFunction = getDependencies || (async (resolve: ResolveFunction) => {
        return Promise.all(dependsOn.map((type) => {
          return resolve(type);
        }));
      });

      return (Klass) => {
        const typeToRegister = name === undefined ? Klass : name;

        container.factory(
          typeToRegister,
          {
            factoryFunction: async (resolve: ResolveFunction) => {
              const dependencies = await dependenciesGetter(resolve);
              return new Klass(...dependencies);
            },
            decoratorFunction,
            tags,
          });
      };
    };
  }

  private buildInjectDecorator(containerId: symbol | string): InjectDecorator {
    return function inject(type: FactoryName) {
      return function decorator(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const existingInjections = Reflect.getOwnMetadata(containerId, target, propertyKey) || [];
        existingInjections.push({
          index: parameterIndex,
          type,
        });
        Reflect.defineMetadata(containerId, existingInjections, target, propertyKey);
      };
    };
  }

  private buildInjectableDecorator(container: Container, containerId: string | symbol): InjectableDecorator {
    return (name?: FactoryName | InjectableOptions, options: InjectableOptions = {}) => {
      if (!isFactoryName(name)) {
        options = <InjectableOptions>(name || {});
        name = undefined;
      }

      const { tags = [], decoratorFunction, getDependencies } = options;
      const dependenciesGetter: InjectableGetDependenciesFunction = getDependencies || (() => ({}));

      return (Klass) => {
        const typeToRegister = name === undefined ? Klass : name;

        container.factory(typeToRegister, {
          factoryFunction: async (resolve: ResolveFunction) => {
            const injections = Reflect.getOwnMetadata(containerId, Klass) || [];
            const providedDeps = await dependenciesGetter(resolve);

            for (const { type, index } of injections) {
              const dep = await resolve(type);
              if (providedDeps[index]) {
                throw new Error(`The dependency for ${typeToRegister.toString()} at index ${index} is already provided by the getDependencies function provided with the injectable decorator. It can not be injected in the constructor.`);
              }
              providedDeps[index] = dep;
            }

            const dependencies = [];
            for (const depIndex of Reflect.ownKeys(providedDeps)) {
              dependencies[toInteger(typeToRegister, depIndex)] = providedDeps[depIndex];
            }

            for (let i = 0; i < dependencies.length; i++) {
              if (dependencies[i] === undefined) {
                console.warn(`You have probably missed to provide a dependency at position ${i} for ${typeToRegister.toString()}`);
              }
            }

            return new Klass(...dependencies);
          },
          tags,
          decoratorFunction,

        });
      };
    };
  }
}
