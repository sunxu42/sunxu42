import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import withPWA from "next-pwa";
import { ELocale } from "./src/models/enums/i18n";

const nextIntlPlugin = createNextIntlPlugin("./src/app/i18n.ts");

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
};

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: ELocale.ZH,
    NEXT_PUBLIC_SUPPORTED_LOCALES: JSON.stringify(Object.values(ELocale)),
  },
};

export default nextIntlPlugin(withPWA(pwaOptions)(nextConfig));
