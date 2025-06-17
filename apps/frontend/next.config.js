/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output so App Hosting can run the server
  output: 'standalone',
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;
