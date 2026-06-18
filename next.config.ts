import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
    qualities: [75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Safety net: allow up to 120s per static page (default is 60s)
  // staticPageGenerationTimeout: 120,
};

export default nextConfig;
