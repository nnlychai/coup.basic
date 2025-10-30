import { client, getTableNames } from './utils';

const reset = async () => {
  const tables = await getTableNames(client);

  const start = Date.now();

  if (tables.length === 0) {
    console.log('✅ No tables to clear');
    return;
  }

  await client.batch(tables.map((name) => ({ sql: `DELETE FROM "${name}";` })));

  const end = Date.now();
  console.log(`✅ cleared ${tables.length} tables in ${end - start}ms`);
};

reset().catch(console.error);
