/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // or 'export' for static sites
  trailingSlash: true, // Try this for Amplify routing
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true,     // Since Next.js Image optimization doesn’t work in static export
  },
};

module.exports = nextConfig;
