"use client";

import { LottieAnimations } from "@/constants/lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslations } from "next-intl";

export default function VCHome() {
  const t = useTranslations("vc");

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-background text-foreground -mt-20 relative w-full h-full"
    >
      <div className="container mx-auto px-4 flex flex-row items-center justify-center gap-8">
        <div className="flex-1 max-w-md">
          <h1 className="text-4xl font-bold mb-2">{t("home.name")}</h1>
          <h2 className="text-2xl font-semibold mb-4">{t("home.role")}</h2>
          <p className="text-lg text-muted-foreground">{t("home.description")}</p>
        </div>
        <div className="w-64 h-64 md:w-96 md:h-96 hidden laptop:flex">
          <DotLottieReact
            src={LottieAnimations.DEVELOPER.path}
            loop
            autoplay
            className="w-full h-full"
          />
        </div>
      </div>
    </section>
  );
}
