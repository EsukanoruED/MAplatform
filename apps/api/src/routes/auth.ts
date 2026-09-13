import { Router } from 'express';
import type { Request, Response } from 'express';
import { env } from '../env';
import { InvalidCredentialsError } from '../lib/errors';
import { authRateLimiter } from '../middleware/rateLimiter';
import { errorHandlerSafe } from '../lib/asyncHandler';
import { publicPrincipal, requireAuth } from '../middleware/requireAuth';
import { validateBody } from '../middleware/validate';
import {
  recordAdminLogin,
  recordCompanyLogin,
  verifyAdminLogin,
  verifyCompanyLogin,
} from '../services/auth';
import { loginSchema } from '../validation/auth';
import type { LoginInput } from '../validation/auth';
import type { Principal } from '../types/principal';

export const authRouter = Router();

/**
 * Regenerate the session id before storing the principal, so a pre-auth session
 * fixated by an attacker cannot become an authenticated one. Then set the TTL —
 * admin sessions expire sooner than company sessions.
 */
function establishSession(req: Request, principal: Principal): Promise<void> {
  const ttlMinutes =
    principal.type === 'admin' ? env.session.adminTtlMinutes : env.session.companyTtlMinutes;

  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateErr) => {
      if (regenerateErr) return reject(regenerateErr);
      req.session.principal = principal;
      req.session.cookie.maxAge = ttlMinutes * 60 * 1000;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

authRouter.post(
  '/company/login',
  authRateLimiter,
  validateBody(loginSchema),
  errorHandlerSafe(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;
    const principal = await verifyCompanyLogin(email, password);
    // One generic failure for unknown email, wrong password and disabled account.
    if (!principal) throw new InvalidCredentialsError();

    await establishSession(req, principal);
    await recordCompanyLogin(principal.id);
    res.status(200).json({ user: publicPrincipal(principal) });
  }),
);

authRouter.post(
  '/admin/login',
  authRateLimiter,
  validateBody(loginSchema),
  errorHandlerSafe(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;
    // Verified against AdminUser only. A CompanyUser's credentials can never
    // authenticate here, and vice versa — separate tables, separate code paths.
    const principal = await verifyAdminLogin(email, password);
    if (!principal) throw new InvalidCredentialsError();

    await establishSession(req, principal);
    await recordAdminLogin(principal.id);
    res.status(200).json({ user: publicPrincipal(principal) });
  }),
);

authRouter.post(
  '/logout',
  errorHandlerSafe(async (req: Request, res: Response) => {
    await new Promise<void>((resolve, reject) => {
      if (!req.session) return resolve();
      req.session.destroy((err) => (err ? reject(err) : resolve()));
    });
    res.clearCookie(env.session.cookieName, { path: '/' });
    res.status(200).json({ ok: true });
  }),
);

authRouter.get('/me', requireAuth, (req: Request, res: Response) => {
  res.status(200).json({ user: publicPrincipal(req.principal!) });
});
