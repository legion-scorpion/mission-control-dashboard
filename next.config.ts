import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: '/home/legion/.openclaw/workspace/mission-control-dashboard/',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
