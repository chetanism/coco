import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';
import { RequestHandler } from 'express';
import * as express from 'express';
import { OptionsUrlencoded } from 'body-parser';

export class UrlEncodedBodyParser extends AbstractApplicationMiddleware {
  constructor(private readonly options: OptionsUrlencoded | false) {
    super();
  }

  get(): RequestHandler | void {
    if (this.options !== false) {
      return express.urlencoded(this.options);
    }
  }
}
