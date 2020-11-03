import { AbstractPlugin } from './AbstractPlugin';
import { ServiceContainer } from '../container';
import deepmerge = require('deepmerge');

export class PluginLoader {
  private plugins: Map<string, AbstractPlugin> = new Map;

  loadPlugin(plugin: AbstractPlugin, { namespace = null }) {
    const ns = namespace || plugin.getDefaultNamespace();
    if (this.plugins.has(ns)) {
      throw new Error(`A plugin with name ${ns} is already added.`);
    }
    this.plugins.set(ns, plugin);
  }

  boot(appConfig: {}, serviceContainer: ServiceContainer) {
    for (const [ns, plugin] of this.plugins) {
      const defaultConfig = plugin.getDefaultConfig();
      const config = appConfig[ns] || {};
      const mergedConfig: object = deepmerge(defaultConfig, config, {
        arrayMerge(target: any[], source: any[]): any[] {
          return source;
        },
      });
      plugin.registerServices(serviceContainer, mergedConfig);
    }
  }
}
