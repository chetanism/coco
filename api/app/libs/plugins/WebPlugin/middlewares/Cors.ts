import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';
import { CorsOptions, CorsOptionsDelegate } from 'cors';
import * as cors from 'cors';
import { RequestHandler } from 'express';

export class Cors extends AbstractApplicationMiddleware {
  constructor(private readonly options: CorsOptions | CorsOptionsDelegate | false) {
    super();
  }

  get(): RequestHandler | void {
    if (this.options !== false) {
      return cors(this.options);
    }
  }
}
