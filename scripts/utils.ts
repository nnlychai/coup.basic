import { type Client, type Config, createClient } from '@libsql/client';

export const DB_Config = {
  url: process.env.DATABASE_URL ?? '',
  authToken: process.env.DATABASE_AUTH_TOKEN ?? '',
} satisfies Config;

export const client: Client = createClient(DB_Config);

type GetTableNames = (libsql: typeof client) => Promise<string[]>;

export const getTableNames: GetTableNames = async (libsql) => {
  const result = await libsql.execute(
    `SELECT name FROM sqlite_master 
     WHERE type='table' 
     AND name NOT LIKE 'sqlite_%' 
     AND name NOT LIKE '_litestream_%';`
  );
  return result.rows.map((row) => row.name as string).filter(Boolean);
};
