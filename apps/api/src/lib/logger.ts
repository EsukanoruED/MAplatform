import pino from 'pino';
import { env } from '../env';

/**
 * Structured application logger.
 *
 * Logging hygiene: this platform handles health-adjacent data, so request and
 * response BODIES are never logged. `redact` is a second line of defence for the
 * fields most likely to leak into a log line by accident.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (env.isTest ? 'silent' : env.isProduction ? 'info' : 'debug'),
  redact: {
    paths: [
      'req.headers.cookie',
      'req.headers.authorization',
      'res.headers["set-cookie"]',
      '*.password',
      '*.passwordHash',
      '*.nationalId',
      '*.dateOfBirth',
      '*.notes',
    ],
    censor: '[redacted]',
  },
});
