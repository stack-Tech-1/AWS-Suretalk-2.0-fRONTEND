/** @type {import('next').NextConfig} */
const nextConfig = {
  //output: 'export', // or 'export' for static sites
  trailingSlash: true, // Try this for Amplify routing
  /* config options here */
  reactStrictMode: true,
  images: {
    unoptimized: true,     // Since Next.js Image optimization doesn't work in static export
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