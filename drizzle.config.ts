import { type Config, defineConfig } from 'drizzle-kit';

import { env } from '@/lib/env';

export default defineConfig({
  dialect: 'turso',
  schema: './src/lib/db/schema/*',
  out: './src/lib/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
    authToken:
      env.DATABASE_AUTH_TOKEN === '' ? undefined : env.DATABASE_AUTH_TOKEN,
  },
  casing: 'snake_case',
  tablesFilter: [`${env.DATABASE_PREFIX}.*`],
  strict: true,
  verbose: true,
} satisfies Config);
