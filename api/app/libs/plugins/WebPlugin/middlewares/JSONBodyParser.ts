import { AbstractApplicationMiddleware } from './AbstractApplicationMiddleware';
import * as express from 'express';
import { RequestHandler } from 'express';
import { OptionsJson } from 'body-parser';

export class JSONBodyParser extends AbstractApplicationMiddleware {
  constructor(private readonly options: OptionsJson | false) {
    super();
  }

  get(): RequestHandler | void {
    if (this.options !== false) {
      return express.json(this.options);
    }
  }
}
