/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    css: {
      lightningcss: false
    }
  }
}

module.exports = nextConfig;
