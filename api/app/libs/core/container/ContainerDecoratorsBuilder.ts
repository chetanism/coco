import 'reflect-metadata';
import { Container, DecoratorFunction, FactoryName, ResolveFunction, Tags } from './Container';


export type GetDependenciesListFunction = (ResolveFunction) => any[] | Promise<any[]>;
export type InjectableGetDependenciesFunction =
  (ResolveFunction) => { [key: number]: any } | Promise<{ [key: number]: any }>;

export type InjectableOptions = {
  tags?: Tags,
  decoratorFunction?: DecoratorFunction,
  getDependencies?: InjectableGetDependenciesFunction,
  dependsOn?: FactoryName[],
  getDependenciesList?: GetDependenciesListFunction
  alias?: string,
}

export type InjectableDecorator =
  (name?: FactoryName | InjectableOptions, options?: InjectableOptions) => (ClassType) => void
export type InjectDecorator =
  (name: FactoryName) => (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

export type ContainerDecorators = {
  injectable: InjectableDecorator,
  inject: InjectDecorator
}

export function isFactoryName(value: FactoryName | InjectableOptions) {
  return ['string', 'number', 'symbol', 'function'].includes(typeof value);
}

function toInteger(name, value: any): number {
  let i = parseInt(value);
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

      const { tags = [], decoratorFunction, getDependencies, alias, dependsOn, getDependenciesList } = options;

      const dependenciesGetter: InjectableGetDependenciesFunction = getDependencies || (() => ({}));
      const dependenciesListGetter: GetDependenciesListFunction = getDependenciesList || (async (resolve: ResolveFunction) => {
        return Promise.all(dependsOn.map((type) => {
          return resolve(type);
        }));
      });

      return (Klass) => {
        const typeToRegister = name === undefined ? Klass : name;

        container.factory(typeToRegister, {
          factoryFunction: async (resolve: ResolveFunction) => {
            let dependencies = [];

            if (dependsOn || getDependenciesList) {
              dependencies = await dependenciesListGetter(resolve);
            } else {
              const injections = Reflect.getOwnMetadata(containerId, Klass) || [];
              const providedDeps = await dependenciesGetter(resolve);

              for (const { type, index } of injections) {
                const dep = await resolve(type);
                if (providedDeps[index]) {
                  throw new Error(`The dependency for ${typeToRegister.toString()} at index ${index} is already provided by the getDependencies function provided with the injectable decorator. It can not be injected in the constructor.`);
                }
                providedDeps[index] = dep;
              }

              for (const depIndex of Reflect.ownKeys(providedDeps)) {
                dependencies[toInteger(typeToRegister, depIndex)] = providedDeps[depIndex];
              }

              for (let i = 0; i < dependencies.length; i++) {
                if (dependencies[i] === undefined) {
                  console.warn(`You have probably missed to provide a dependency at position ${i} for ${typeToRegister.toString()}`);
                }
              }
            }

            return new Klass(...dependencies);
          },
          tags,
          decoratorFunction,
          alias,
        });
      };
    };
  }
}
