import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,         // Required for Apache/Hostinger to find index.html
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    qualities: [8, 30, 75, 80, 85, 90, 95, 100],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  staticPageGenerationTimeout: 180,
};

export default nextConfig;
