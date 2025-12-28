"use client";

import { usePathname } from "next/navigation";
import { LottieAnimations } from "@/constants/lottie";
import { DotLottie, DotLottieReact } from "@lottiefiles/dotlottie-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const TRANSITION_ROUTES = ["vc", "profile"];

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dotLottieRef = useRef<DotLottie | null>(null);
  const isMountedRef = useRef(true);
  const prevPathnameRef = useRef(pathname);
  const hasInitializedRef = useRef(false);

  const shouldShowTransition = (path: string) => {
    const route = path.split("/").filter(Boolean)[1] || "";
    return TRANSITION_ROUTES.includes(route);
  };

  const getRouteWithoutLocale = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    return parts.length > 1 ? parts.slice(1).join("/") : "";
  };

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

  useLayoutEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      prevPathnameRef.current = pathname;
      return;
    }

    const currentRoute = getRouteWithoutLocale(pathname);
    const prevRoute = getRouteWithoutLocale(prevPathnameRef.current);

    if (!shouldShowTransition(pathname) || currentRoute === prevRoute) {
      prevPathnameRef.current = pathname;
      return;
    }

    requestAnimationFrame(() => {
      setIsTransitioning(true);
    });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        setIsTransitioning(false);
      }
    }, 1200);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
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
