import createMiddleware from "next-intl/middleware";
import { ELocale } from "./models/enums/i18n";

export default createMiddleware({
  locales: [ELocale.ZH, ELocale.EN],
  defaultLocale: ELocale.ZH,
  localePrefix: "always",
});

export const config = {
  matcher: ["/", "/(zh|en)/:path*"],
};
