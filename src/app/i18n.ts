import { getRequestConfig } from "next-intl/server";
import { ELocale } from "../models/enums/i18n";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !Object.values(ELocale).includes(locale as ELocale)) {
    locale = ELocale.ZH;
  }

  const messages = await Promise.all([
    import(`../messages/${locale}/common.json`),
    import(`../messages/${locale}/home.json`),
    import(`../messages/${locale}/login.json`),
  ]).then(([common, home, login]) => ({
    common: common.default,
    home: home.default,
    login: login.default,
  }));

  return {
    locale,
    messages,
  };
});
