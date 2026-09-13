import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Wraps an async handler so a rejected promise reaches the error middleware.
 *
 * Express 5 forwards rejections from async handlers on its own; this wrapper is
 * kept as an explicit, version-independent guarantee and to give the handlers a
 * single, greppable shape.
 */
export function errorHandlerSafe(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}
