"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button, LanguageSwitcher, ThemeSwitcher } from "@/components/ui";

export default function Home() {
  const t = useTranslations("common");
  const router = useRouter();
  const locale = useLocale();

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/login`)}
              className="cursor-pointer"
            >
              {t("login")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push(`/${locale}/lottie-animation`)}
              className="cursor-pointer"
            >
              {t("animation")}
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
    </div>
  );
}
