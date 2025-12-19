import { cookies } from "next/headers";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/constants";
import { getRequestConfig } from "next-intl/server";

// 服务端获取语言：优先 Cookie，兜底默认语言
export async function getServerLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get("user-locale")?.value as Locale;
  // 验证语言合法性
  if (SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  return "zh"; // 默认语言
}

export default getRequestConfig(async () => {
  const locale = await getServerLocale();
  return {
    locale,
    messages: {
      ...(await import(`./locales/${locale}/login.json`)).default,
      ...(await import(`./locales/${locale}/profile.json`)).default,
      ...(await import(`./locales/${locale}/home.json`)).default,
    },
  };
});
