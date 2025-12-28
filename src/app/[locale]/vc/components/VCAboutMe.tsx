"use client";

import { LottieAnimations } from "@/constants/lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslations } from "next-intl";

export default function VCAboutMe() {
  const t = useTranslations("vc");

  return (
    <section id="about-me" className="min-h-screen flex items-center justify-center bg-background text-foreground w-full h-full">
      <div className="container mx-auto px-4 flex flex-row items-center justify-center gap-8">
        <div className="w-64 h-64 md:w-96 md:h-96 hidden laptop:flex">
          <DotLottieReact
            src={LottieAnimations.DEVELOPER_SKILLS.path}
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
        <div className="flex-1 max-w-md">
          <h1 className="text-4xl font-bold mb-2">{t("aboutMe.title")}</h1>
          <h2 className="text-2xl font-semibold mb-4">{t("aboutMe.subtitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("aboutMe.description")}</p>
        </div>
      </div>
    </section>
  );
}
