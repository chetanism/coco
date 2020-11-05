import { Container, FactoryName } from './Container';

export abstract class ServiceLocator {
  private _container: Container;

  set container(container: Container) {
    if (!this._container) {
      this._container = container;
    } else {
      throw new Error('container property is already set');
    }
  }

  abstract getSupportedServices(): FactoryName[];

  async resolve(name: FactoryName) {
    if (!this.getSupportedServices().includes(name)) {
      throw new Error(`Unsupported service requested ${name.toString()}`);
    }
    return this._container.resolve(name);
  }

  async resolveByAlias(alias: string) {
    if (!this.getSupportedServicesAliases().includes(alias)) {
      throw new Error(`Unsupported service requested by alias: ${alias}`);
    }
    return this._container.resolveByAlias(alias);
  }

  async resolveAll() {
    return Promise.all(
      this.getSupportedServices().map((type: FactoryName) => this.resolve(type)),
    );
  }

  private getSupportedServicesAliases() {
    return this.getSupportedServices().map((name: FactoryName) => this._container['factories'].get(name).alias)
  }
}

