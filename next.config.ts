import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow streaming responses to flush without buffering
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
