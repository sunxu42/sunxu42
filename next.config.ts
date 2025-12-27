import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { ELocale } from "./src/models/enums/i18n";

const nextIntlPlugin = createNextIntlPlugin("./src/app/i18n.ts");

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_DEFAULT_LOCALE: ELocale.ZH,
    NEXT_PUBLIC_SUPPORTED_LOCALES: JSON.stringify(Object.values(ELocale)),
  },
};

export default nextIntlPlugin(nextConfig);
