import { NextFunction, Request, RequestHandler, Response } from 'express';

export abstract class AbstractMiddleware {
  middleware: RequestHandler | null = null;
}
