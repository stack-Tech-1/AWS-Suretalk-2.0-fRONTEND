/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    // Better tree-shaking for large icon/animation libraries
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  webpack: (config) => {
    // Bundle recharts once and share across all pages instead of including per-page
    config.optimization.splitChunks.cacheGroups = {
      ...config.optimization.splitChunks.cacheGroups,
      recharts: {
        test: /[\\/]node_modules[\\/]recharts/,
        name: 'recharts',
        chunks: 'all',
        priority: 10,
      },
    };
    return config;
  },

  // COOP header — relaxed to allow OAuth/payment popups
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ];
  },

  // ADD REDIRECTS HERE
  async redirects() {
    return [
      {
        source: '/verify',
        destination: '/verify-email',
        permanent: true,
      },
      {
        source: '/email-verify',
        destination: '/verify-email',
        permanent: true,
      },
      {
        source: '/verify-email/:token',
        destination: '/verify-email?token=:token',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;