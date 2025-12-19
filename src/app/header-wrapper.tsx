"use client";

import { usePathname } from "next/navigation";
import { useTokenRefresh } from "@/lib/hooks/useTokenRefresh";
import { Header } from "@/components/Header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  // 使用token刷新钩子，自动处理token过期
  useTokenRefresh();

  const isLoginPage = pathname === "/login";

  // 始终根据路径判断是否显示Header，避免水合过程中重复渲染
  return <>{!isLoginPage && <Header />}</>;
}
