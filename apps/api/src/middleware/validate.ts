import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError } from '../lib/errors';

/**
 * Validates and replaces `req.body` with the parsed result, so handlers receive
 * only fields the schema declares. Unknown keys are stripped by the schema — a
 * client-supplied `companyId` can therefore never reach a handler.
 */
export function validateBody<T>(schema: ZodType<T>) {
  return function bodyValidator(req: Request, _res: Response, next: NextFunction): void {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(
        new ValidationError(
          'The request body failed validation.',
          result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        ),
      );
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Same, for query strings. The parsed value is exposed as `res.locals.query`. */
export function validateQuery<T>(schema: ZodType<T>) {
  return function queryValidator(req: Request, res: Response, next: NextFunction): void {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(
        new ValidationError(
          'The query string failed validation.',
          result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        ),
      );
      return;
    }
    res.locals.query = result.data;
    next();
  };
}

/** Same, for route params. The parsed value is exposed as `res.locals.params`. */
export function validateParams<T>(schema: ZodType<T>) {
  return function paramsValidator(req: Request, res: Response, next: NextFunction): void {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(
        new ValidationError(
          'The request path failed validation.',
          result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
        ),
      );
      return;
    }
    res.locals.params = result.data;
    next();
  };
}
