import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'prisma/config';

// Replaces the deprecated `package.json#prisma` block. Declaring a Prisma config
// turns off Prisma's implicit .env loading, so load it explicitly here — the CLI
// and the running API then read exactly the same file.
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true });

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: 'tsx prisma/seed.ts',
  },
});
