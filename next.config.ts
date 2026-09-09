import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/*": ["./node_modules/styled-jsx/**/*"],
  },
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
