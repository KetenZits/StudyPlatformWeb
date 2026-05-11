import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warnings are enforced in the IDE and CI lint step,
    // but should not block production builds.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
