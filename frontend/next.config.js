/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    LOCAL_SERVER_URL: process.env.LOCAL_SERVER_URL || 'http://localhost:3001',
  },
}

module.exports = nextConfig 