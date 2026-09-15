-- Brings the express-session / connect-pg-simple table under migration control.
--
-- The session store creates this table at runtime (`createTableIfMissing: true`
-- in src/app.ts), which left it invisible to Prisma and therefore reported as
-- schema drift on every subsequent `migrate dev`. Declaring it here makes the
-- migration history match the real database without dropping anything.
--
-- IF NOT EXISTS throughout: this must be a no-op on an environment where the
-- store already created the table, and must still provision it on a fresh one.
-- It is deliberately NOT a Prisma model — no application code queries it, and
-- modelling it would put session rows on the Prisma client's public surface.

CREATE TABLE IF NOT EXISTS "user_sessions" (
    "sid" character varying NOT NULL,
    "sess" json NOT NULL,
    "expire" timestamp(6) without time zone NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'session_pkey'
    ) THEN
        ALTER TABLE "user_sessions"
            ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "user_sessions" ("expire");
