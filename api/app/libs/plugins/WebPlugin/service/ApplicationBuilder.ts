import * as express from 'express';
import { Application } from 'express';
import { ApplicationMiddlewareServiceLocator } from './ApplicationMiddlewareServiceLocator';
import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';

export type ApplicationOptions = {
  staticPath?: string,
}

export class ApplicationBuilder {
  private app: Application;
  private options: ApplicationOptions;

  constructor(
    options: ApplicationOptions = {},
    private readonly middlewaresLocator: ApplicationMiddlewareServiceLocator,
  ) {
  }

  async build() {
    this.app = express();
    const middlewares: AbstractApplicationMiddleware[] = await this.middlewaresLocator.resolveAll();

    for (const middleware of middlewares) {
      const mw = middleware.get();
      if (mw) {
        this.app.use(mw);
      }
    }

    if (this.options.staticPath) {
      this.app.use(express.static(this.options.staticPath));
    }

    return this.app;
  }
}
