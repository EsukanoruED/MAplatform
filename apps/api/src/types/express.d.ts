import type { Principal } from './principal';

declare global {
  namespace Express {
    interface Request {
      /**
       * Set by `requireAuth`. Handlers behind that middleware can rely on it;
       * everywhere else it may be undefined.
       */
      principal?: Principal;
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    /**
     * The persisted principal. Stored server-side in Postgres — the browser only
     * ever holds the signed session id in an httpOnly cookie.
     */
    principal?: Principal;
  }
}

export {};
