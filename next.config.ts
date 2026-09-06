import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.aliyuncs.com",
      },
      {
        protocol: "https",
        hostname: "**.oss-cn-*.aliyuncs.com",
      },
    ],
  },
};

export default nextConfig;
