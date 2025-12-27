"use client";

import { usePathname } from "next/navigation";
import { LottieAnimations } from "@/constants/lottie";
import { DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useEffectEvent, useRef, useState } from "react";

const TRANSITION_ROUTES = ["login", "profile"];

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevPathnameRef = useRef(pathname);
  const hasStartedTransitionRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);
  const isMountedRef = useRef(true);

  const shouldTransition = (path1: string, path2: string) => {
    const route1 = path1.split("/").filter(Boolean)[1] || "";
    const route2 = path2.split("/").filter(Boolean)[1] || "";

    return TRANSITION_ROUTES.includes(route1) || TRANSITION_ROUTES.includes(route2);
  };

  const startTransition = useEffectEvent(() => {
    setIsTransitioning(true);
  });

  const endTransition = useEffectEvent(() => {
    setIsTransitioning(false);
    prevPathnameRef.current = pathname;
    hasStartedTransitionRef.current = false;
  });

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

  useEffect(() => {
    if (pathname !== prevPathnameRef.current && !hasStartedTransitionRef.current) {
      if (shouldTransition(pathname, prevPathnameRef.current)) {
        hasStartedTransitionRef.current = true;

        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        startTransition();

        timerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            endTransition();
          }
        }, 1200);

        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        };
      } else {
        prevPathnameRef.current = pathname;
      }
    }
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            onAnimationComplete={() => {
              if (!isTransitioning && dotLottieRef.current) {
                dotLottieRef.current.stop();
              }
            }}
          >
            <div className="w-64 h-64">
              <DotLottieReact
                src={LottieAnimations.DYNAMIC_QUAD_CUBES.path}
                loop
                autoplay
                className="w-full h-full"
                dotLottieRefCallback={dotLottie => {
                  dotLottieRef.current = dotLottie;
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!isTransitioning && (
        <motion.div
          className="w-full"
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {children}
        </motion.div>
      )}
    </>
  );
}
