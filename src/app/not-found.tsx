"use client";

import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { LottieAnimations } from "@/constants/lottie";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <DotLottieReact
        src={LottieAnimations.ERROR_404.path}
        autoplay
        className="w-1/2 h-1/2"
      />
    </div>
  );
}
