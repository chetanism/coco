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

  async resolveAll() {
    return Promise.all(
      this.getSupportedServices().map((type: FactoryName) => this.resolve(type)),
    );
  }
}

