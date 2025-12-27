"use client";

import { LottieAnimations } from "@/constants/lottie";
import { DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useEffect, useRef } from "react";

function AnimationCard({ name, path }: { name: string; path: string }) {
  const dotLottieRef = useRef<DotLottie | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (dotLottieRef.current) {
        dotLottieRef.current.stop();
        dotLottieRef.current.destroy();
        dotLottieRef.current = null;
      }
    };
  }, []);

  return (
    <div
      key={name}
      className="bg-card border border-border rounded-lg p-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow"
    >
      <h2 className="text-xl font-semibold mb-4">{name}</h2>
      <div className="w-full aspect-square flex items-center justify-center">
        <DotLottieReact
          src={path}
          loop
          autoplay
          className="w-full h-full"
          dotLottieRefCallback={(dotLottie: DotLottie) => {
            dotLottieRef.current = dotLottie;
          }}
        />
      </div>
    </div>
  );
}

export default function LottieAnimationPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Lottie Animations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Object.values(LottieAnimations).map(animation => (
          <AnimationCard key={animation.name} name={animation.name} path={animation.path} />
        ))}
      </div>
    </div>
  );
}
