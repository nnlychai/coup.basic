import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from 'drizzle-zod';
import type z from 'zod';

import { id, timestamps } from '@/lib/db/columns';
import { createTable } from '@/lib/db/utils';

export const computers = createTable('computers', (t) => ({
  id,
  brand: t.text().notNull(),
  cores: t.integer().notNull(),
  ...timestamps,
}));

export const computerSelectSchema = createSelectSchema(computers).strict();

export const computerInsertSchema = createInsertSchema(computers)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .strict()
  .refine((data) => data.cores > 0, {
    message: 'Cores must be greater than 0',
    path: ['cores'],
  });

export const computerUpdateSchema = createUpdateSchema(computers)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial()
  .strict();

export const computerIdSchema = computerSelectSchema.pick({ id: true });

export type Computer = z.infer<typeof computerSelectSchema>;
export type NewComputer = z.infer<typeof computerInsertSchema>;
export type ComputerId = z.infer<typeof computerIdSchema>;
