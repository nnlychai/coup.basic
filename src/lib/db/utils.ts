import { sqliteTableCreator } from 'drizzle-orm/sqlite-core';

import { env } from '@/lib/env';

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `${env.DATABASE_PREFIX}.${name}`
);
