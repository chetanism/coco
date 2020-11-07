import { AbstractPlugin } from '../../core/plugins/AbstractPlugin';
import { ServiceContainer } from '../../core/container';
import { controller } from './decorators/controller';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import { Cors } from './middlewares/Cors';
import { OptionsJson, OptionsUrlencoded } from 'body-parser';
import { JSONBodyParser } from './middlewares/JSONBodyParser';
import { UrlEncodedBodyParser } from './middlewares/UrlEncodedBodyParser';
import { ApplicationBuilder, ApplicationOptions } from './service/ApplicationBuilder';
import { ApplicationMiddlewareServiceLocator } from './service/ApplicationMiddlewareServiceLocator';
import { ControllerLocator } from './service/ControllerLocator';
import { ApplicationServer, ServerOptions } from './service/ApplicationServer';
import { MiddlewareServiceLocator } from './service/MiddlewareServiceLocator';

export type WebPluginOptions = {
  cors: CorsOptions | CorsOptionsDelegate | false,
  bodyParser: {
    json: OptionsJson | false,
    urlencoded: OptionsUrlencoded | false
  },
  app: ApplicationOptions,
  server: ServerOptions,
}


export class WebPlugin extends AbstractPlugin {
  getDefaultNamespace() {
    return 'web';
  }

  getDefaultConfig(): {} {
    return {
      bodyParser: {
        urlencoded: {
          extended: false,
        },
      },
      app: {
        staticPath: '',
      },
      server: {
        port: 4200,
      },
    };
  }

  registerServices(serviceContainer: ServiceContainer, config: WebPluginOptions) {
    const { decorators: { injectable } } = serviceContainer;
    controller.injectable = injectable;

    injectable({ getDependenciesList: () => [config.cors] })(Cors);
    injectable({ getDependenciesList: () => [config.bodyParser.json] })(JSONBodyParser);
    injectable({ getDependenciesList: () => [config.bodyParser.urlencoded] })(UrlEncodedBodyParser);

    injectable({
      getDependenciesList: async (resolve) => [
        config.app,
        await resolve(ApplicationMiddlewareServiceLocator),
        await resolve(MiddlewareServiceLocator),
        await resolve(ControllerLocator),
      ],
    })(ApplicationBuilder);

    injectable()(ApplicationMiddlewareServiceLocator);
    injectable()(MiddlewareServiceLocator);

    injectable({
      getDependenciesList: async (resolve) => {
        const appBuilder: ApplicationBuilder = await resolve(ApplicationBuilder);
        const app = await appBuilder.build();
        return [config.server, app];
      },
    })(ApplicationServer);

    injectable()(ControllerLocator);
  }
}
