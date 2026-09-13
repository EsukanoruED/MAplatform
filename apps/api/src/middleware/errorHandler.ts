import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../lib/errors';
import { logger } from '../lib/logger';
import { env } from '../env';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `No route matches ${req.method} ${req.path}.` },
  });
}

/**
 * The single place an error becomes an HTTP response. Always emits
 * `{ error: { code, message } }`. Stack traces and raw Prisma/driver errors are
 * logged server-side and never sent to the client.
 */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof AppError) {
    // 4xx is caller error, not a server fault — log at a low level without a stack.
    logger.debug({ code: err.code, status: err.status, path: req.path }, 'request rejected');
    res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'The request body failed validation.',
        details: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      },
    });
    return;
  }

  logger.error(
    { err, path: req.path, method: req.method },
    'unhandled error while processing request',
  );

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: env.isProduction
        ? 'Something went wrong. The incident has been logged.'
        : `Something went wrong: ${err instanceof Error ? err.message : String(err)}`,
    },
  });
}
