import { PluginLoader } from '../plugins/PluginLoader';
import { AbstractPlugin } from '../plugins/AbstractPlugin';
import {
  ContainerBuilder,
  ContainerDecorators,
  RegisterFactoryFunction,
  RegisterValueFunction,
  ServiceContainer,
} from '../container';
import { Autoloader } from '../autoloader/Autoloader';

export interface Container extends ContainerDecorators {
  factory: RegisterFactoryFunction,
  value: RegisterValueFunction
}

export type KernelOptions = {
  debug: boolean,
  env: string,
  autoloadDirs: string[],
}

export type AddPluginOptions = {
  namespace?: string,
  envs?: string[]
}

async function sleep(n) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), n);
  })
}

export class Kernel {
  private pluginLoader = new PluginLoader();
  private serviceContainer: ServiceContainer = new ContainerBuilder().buildContainer();
  private autoloader = new Autoloader();

  constructor(
    private readonly options: KernelOptions,
  ) {
  }

  addPlugin(plugin: AbstractPlugin, options: AddPluginOptions = {}) {
    if (options.envs === undefined || options.envs.includes(this.options.env))
      this.pluginLoader.loadPlugin(plugin, { namespace: options.namespace });
  }

  boot(appConfig) {
    this.pluginLoader.boot(appConfig, this.serviceContainer);
    const promise = this.autoloadFiles();
    this.serviceContainer.container.pauseFor(promise);
  }

  getContainer(): ServiceContainer {
    return this.serviceContainer;
  }

  private async autoloadFiles() {
    console.log('Registering services..');
    for(const dir of this.options.autoloadDirs) {
      await this.autoloader.load(dir);
    }
  }
}

// bundles can->
// add commands, -> add command classes to container
// have config, ->
// have events listener, ->
// register services, ->
// get services injected, ->
// trigger events ->

