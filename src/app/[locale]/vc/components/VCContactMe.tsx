"use client";

import { useTranslations } from "next-intl";

export default function VCContactMe() {
  const t = useTranslations("vc");

  return (
    <section
      id="contact-me"
      className="min-h-screen flex items-center justify-center bg-background text-foreground w-full h-full"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center">{t("contactMe.title")}</h1>
      </div>
    </section>
  );
}
