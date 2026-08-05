import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // AVIF first, WebP as the fallback for older browsers.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'https',
        hostname: 'assets.calendly.com',
      },
    ],
  },
  async headers() {
    return [
      {
        // Filenames under /public are not content-hashed, so a long max-age
        // pins a stale asset until it expires and re-exported art silently
        // fails to appear. 'no-cache' still stores the file and revalidates
        // with an ETag, so repeat visits cost a 304 rather than a re-download,
        // and an updated file is picked up immediately.
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
      {
        source: '/chat/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

export default nextConfig;
