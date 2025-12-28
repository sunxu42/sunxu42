"use client";

import { LottieAnimations } from "@/constants/lottie";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <DotLottieReact src={LottieAnimations.ERROR_404.path} loop autoplay className="w-3/4" />
    </div>
  );
}
