import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Next doesn't pick up an unrelated lockfile
  // higher up the filesystem (e.g. in the user's home directory).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
