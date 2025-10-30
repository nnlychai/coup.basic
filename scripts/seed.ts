import { db } from '@/lib/db/client';
import { computers } from '@/lib/db/schema/computers';

async function seed() {
  console.log('🌱 Seeding computers...');

  const data = [
    { brand: 'Apple', cores: 8 },
    { brand: 'Dell', cores: 6 },
    { brand: 'HP', cores: 4 },
    { brand: 'Lenovo', cores: 12 },
  ].map((c) => ({
    brand: c.brand,
    cores: c.cores,
  }));

  const start = Date.now();

  try {
    await db.insert(computers).values(data);
    const end = Date.now();

    console.log(`✅ Seeded ${data.length} computers in ${end - start}ms`);
  } catch (error) {
    console.error('❌ Failed to seed computers:', error);
  } finally {
    process.exit(0);
  }
}

seed();
