"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher, ThemeSwitcher } from "@/components/ui";

export default function Home() {
  const t = useTranslations("common");
  const homeT = useTranslations("home");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">{t("title")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 mx-auto min-w-[280px] lg:min-w-[600px]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{homeT("welcome")}</h2>
          <p className="text-lg text-muted-foreground">{homeT("description")}</p>

          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">{homeT("features")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg border bg-card text-card-foreground">
                <h4 className="text-xl font-semibold mb-3">{t("features.feature1.title")}</h4>
                <p>{t("features.feature1.description")}</p>
              </div>
              <div className="p-6 rounded-lg border bg-card text-card-foreground">
                <h4 className="text-xl font-semibold mb-3">{t("features.feature2.title")}</h4>
                <p>{t("features.feature2.description")}</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">{homeT("contact")}</h3>
            <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              {homeT("learnMore")}
            </button>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
