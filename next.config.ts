/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest:'public',
  register: true,
  skipWaiting: true,
  fallbacks: {
   document: '/offline.html',
  }
});
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
