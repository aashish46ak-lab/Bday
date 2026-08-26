import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Build should not fail on leftover lint warnings in production
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
