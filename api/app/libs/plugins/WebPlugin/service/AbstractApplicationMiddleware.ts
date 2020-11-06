import { NextFunction, Request, RequestHandler, Response } from 'express';

export abstract class AbstractApplicationMiddleware {
  abstract get(): RequestHandler | void;
}
