import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  // Allow cross-origin requests in development
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
};

export default nextConfig;
