import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mybaicao.oss-cn-shenzhen.aliyuncs.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
