import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import { cn } from '@/lib/utils';

const sans = GeistSans;
const mono = GeistMono;

export const fonts = cn(
  sans.variable,
  mono.variable,
  'touch-manipulation font-sans text-foreground-light leading-relaxed antialiased'
);
