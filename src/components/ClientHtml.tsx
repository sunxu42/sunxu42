import { cookies } from "next/headers";
import { SUPPORTED_LOCALES } from "@/lib/constants";

interface ClientHtmlProps {
  children: React.ReactNode;
}

export default async function ClientHtml({ children }: ClientHtmlProps) {
  // 从Cookie获取语言偏好，默认中文
  const cookieStore = await cookies();
  const userLocale = cookieStore.get("user-locale")?.value;
  const locale = SUPPORTED_LOCALES.includes(userLocale as any)
    ? userLocale
    : "zh";

  return (
    <html
      lang={locale}
      className={"scroll-smooth"}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      {children}
    </html>
  );
}
