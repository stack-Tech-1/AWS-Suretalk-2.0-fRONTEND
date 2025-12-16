/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' for static sites
  trailingSlash: true, // Try this for Amplify routing
  /* config options here */
  reactStrictMode: true,
};

export default nextConfig;
