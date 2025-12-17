import type { NextConfig } from "next";
import withPWA from "next-pwa";

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // 添加turbopack配置以避免构建错误
  turbopack: {},
};

export default withPWA(pwaOptions)(nextConfig);
