"use client";

import { useTranslations } from "next-intl";

export default function VCProjects() {
  const t = useTranslations("vc");

  return (
    <section
      id="projects"
      className="min-h-screen flex items-center justify-center bg-background text-foreground w-full h-full"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center">{t("projects.title")}</h1>
      </div>
    </section>
  );
}
