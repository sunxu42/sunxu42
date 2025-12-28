"use client";

import { usePathname, useRouter } from "next/navigation";
import { ELocale } from "@/models/enums/i18n";
import { Button } from "./button";

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  // 安全地获取当前 locale
  const currentLocale = (pathname.split("/")[1] as ELocale) || ELocale.ZH;

  // 确保 locale 是有效的
  if (!Object.values(ELocale).includes(currentLocale)) {
    console.error("Invalid locale:", currentLocale);
  }

  const toggleLanguage = () => {
    const newLocale = currentLocale === ELocale.ZH ? ELocale.EN : ELocale.ZH;
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "");
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="cursor-pointer rounded-full"
    >
      <span className="text-sm font-medium">{currentLocale === ELocale.ZH ? "EN" : "中文"}</span>
    </Button>
  );
}
