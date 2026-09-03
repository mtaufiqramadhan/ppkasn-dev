import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use standalone output for Docker / self-hosted environments
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
