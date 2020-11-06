import { NextFunction, Request, RequestHandler, Response } from 'express';

export abstract class AbstractApplicationMiddleware {
  middleware: RequestHandler | null = null;
  abstract get(): RequestHandler | void;
}
