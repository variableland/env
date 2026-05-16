import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace-linked deps (`@vlandoss/env`) need to be transpiled by Next.
  transpilePackages: ["@vlandoss/env"],
};

export default nextConfig;
