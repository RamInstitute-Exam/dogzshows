import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    qualities: [75, 80, 85, 90, 100],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },

  // Safety net: allow up to 120s per static page (default is 60s)
  staticPageGenerationTimeout: 120,
};

export default nextConfig;
