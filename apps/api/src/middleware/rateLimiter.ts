import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';
import { env } from '../env';

/**
 * Brute-force guard on the login routes. Keyed on IP **plus** the submitted
 * email, so one attacker cannot lock every account from a shared NAT, and
 * credential-stuffing one account from many addresses still trips the limit.
 *
 * `ipKeyGenerator` is express-rate-limit's IPv6-safe normaliser; using req.ip
 * raw would let an attacker rotate through a /64 for free.
 */
export const authRateLimiter = rateLimit({
  windowMs: env.authRateLimit.windowMinutes * 60 * 1000,
  limit: env.authRateLimit.maxAttempts,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Tests exercise the limiter explicitly; a global cap would make every other
  // auth test order-dependent.
  skip: () => env.isTest && process.env.ENABLE_RATE_LIMIT_IN_TESTS !== 'true',
  keyGenerator: (req: Request) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    return `${ipKeyGenerator(req.ip ?? '')}:${email}`;
  },
  message: {
    error: {
      code: 'TOO_MANY_ATTEMPTS',
      message: 'Too many sign-in attempts. Try again later.',
    },
  },
});
