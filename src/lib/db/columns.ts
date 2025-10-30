import { sql } from 'drizzle-orm';
import { integer, text } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

export const id = text()
  .primaryKey()
  .$default(() => nanoid(21));

export const timestamps = {
  createdAt: integer({ mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer({ mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
};
