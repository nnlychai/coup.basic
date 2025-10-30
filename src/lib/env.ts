import { vercel } from '@t3-oss/env-core/presets-zod';
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  extends: [vercel()],
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  server: {
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().default(3000),

    DATABASE_URL: z.string(),
    DATABASE_PREFIX: z.string().default('coop'),
    DATABASE_AUTH_TOKEN: z.string().optional(),
  },
  runtimeEnv: {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,

    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_PREFIX: process.env.DATABASE_PREFIX,
    DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,

    NEXT_PUBLIC_BASE_URL:
      process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
