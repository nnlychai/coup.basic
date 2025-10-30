import { createJiti } from 'jiti';
import type { NextConfig } from 'next';

const jiti = createJiti(import.meta.url);

jiti.import('./src/lib/env');

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  experimental: {
    browserDebugInfoInTerminal: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
