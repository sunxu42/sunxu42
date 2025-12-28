"use client";

import { useTranslations } from "next-intl";
import { Button, LanguageSwitcher, ThemeSwitcher } from "@/components/ui";

export default function VCHeader() {
  const t = useTranslations("vc");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky h-16 top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-full items-center justify-between px-4 mx-auto">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">VC</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => scrollToSection("home")}>
              {t("nav.home")}
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("about-me")}>
              {t("nav.aboutMe")}
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("projects")}>
              {t("nav.projects")}
            </Button>
            <Button variant="ghost" onClick={() => scrollToSection("contact-me")}>
              {t("nav.contactMe")}
            </Button>
          </div>
          <div className="flex items-center gap-2 border-l pl-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}
