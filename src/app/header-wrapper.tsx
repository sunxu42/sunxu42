"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { initializeTheme, setupSystemThemeListener } from "@/lib/store/theme";
import { initializeAuth } from "@/lib/store/auth";
import { useTokenRefresh } from "@/lib/hooks/useTokenRefresh";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  let cleanupListener: (() => void) | undefined;

  // 使用token刷新钩子，自动处理token过期
  useTokenRefresh();

  useEffect(() => {
    // 标记水合完成
    setMounted(true);

    // 只在水合完成后才初始化主题和设置系统主题监听
    initializeTheme();
    cleanupListener = setupSystemThemeListener();

    // 初始化认证状态（异步调用）
    const initAuth = async () => {
      await initializeAuth();
    };
    initAuth();

    return () => {
      if (cleanupListener) cleanupListener();
    };
  }, []);

  // 在服务器上默认显示Header，避免水合不匹配
  if (!mounted) {
    return <Header />;
  }

  const isLoginPage = pathname === "/login";

  return <>{!isLoginPage && <Header />}</>;
}
