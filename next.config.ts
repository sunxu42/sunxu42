import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { ELocale } from "./src/models/enums/i18n";

const nextIntlPlugin = createNextIntlPlugin("./src/app/i18n.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {},
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: ELocale.ZH,
    NEXT_PUBLIC_SUPPORTED_LOCALES: JSON.stringify(Object.values(ELocale)),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fonts.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "fonts.gstatic.com",
      },
    ],
  },
};

export default nextIntlPlugin(nextConfig);
