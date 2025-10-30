import { client, getTableNames } from './utils';

const drop = async () => {
  const tables = await getTableNames(client);

  const start = Date.now();

  if (tables.length === 0) {
    console.log('✅ found no tables to drop');
    return;
  }

  await client.batch(
    tables.map((name) => ({ sql: `DROP TABLE IF EXISTS "${name}";` }))
  );

  const end = Date.now();
  console.log(`✅ Dropped ${tables.length} tables in ${end - start}ms`);
};

drop().catch(console.error);
