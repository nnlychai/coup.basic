import { type Client, createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

import * as schema from '@/lib/db/schema';
import { env } from '@/lib/env';

const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ??
  createClient({
    url: env.DATABASE_URL,
    authToken:
      env.DATABASE_AUTH_TOKEN === '' ? undefined : env.DATABASE_AUTH_TOKEN,
  });
if (env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, {
  schema,
  casing: 'snake_case',
  logger: false,
});
