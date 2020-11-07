import { NextFunction, Request, RequestHandler, Response } from 'express';

export abstract class AbstractApplicationMiddleware {
  middleware: RequestHandler | null = null;
  get(): RequestHandler | void {};
}
