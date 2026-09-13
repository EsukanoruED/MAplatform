import express from 'express';
import type { Express } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './env';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { requestsRouter } from './routes/requests';
import { employeesRouter } from './routes/employees';
import { adminRouter } from './routes/admin';

const PgSession = connectPgSimple(session);

export function createApp(): Express {
  const app = express();

  // Behind a platform proxy (Render/Railway/Fly), trust the first hop so
  // `secure` cookies and the rate limiter see the real protocol and client IP.
  if (env.isProduction) app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // The API serves JSON only; a CSP belongs on the document response, which
      // the web app's host serves.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  if (!env.isTest) {
    app.use(
      pinoHttp({
        logger,
        // Health checks would otherwise dominate the log.
        autoLogging: { ignore: (req) => req.url === '/health' },
      }),
    );
  }

  app.use(express.json({ limit: '256kb' }));

  app.use(
    session({
      name: env.session.cookieName,
      secret: env.session.secret,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      // Sessions live in Postgres, not in memory: they survive a restart and work
      // across more than one API instance. The browser only ever holds the
      // signed session id.
      store: new PgSession({
        conString: env.databaseUrl,
        tableName: 'user_sessions',
        createTableIfMissing: true,
        pruneSessionInterval: env.isTest ? false : 60,
      }),
      cookie: {
        httpOnly: true, // never readable from JavaScript — no token in localStorage
        secure: env.isProduction, // HTTPS-only outside local development
        sameSite: 'lax', // blocks cross-site POSTs carrying the cookie
        path: '/',
        maxAge: env.session.companyTtlMinutes * 60 * 1000,
      },
    }),
  );

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'ma-api', time: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/requests', requestsRouter);
  app.use('/api/employees', employeesRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
