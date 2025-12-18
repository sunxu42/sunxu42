"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";
import { useTranslations } from 'next-intl/react';

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuthStore();
  const t = useTranslations();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky flex justify-center top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6">
        {/* 应用名称 */}
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight text-primary transition-colors duration-200 hover:text-primary/90">
            <Link href="/" className="cursor-pointer flex items-center gap-2">
              <span>sunxu42</span>
            </Link>
          </div>
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 语言切换 */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(pathname.replace(/^\/(en|zh)\//, '/en/') || '/en/')}
              className={`cursor-pointer rounded-full ${pathname.startsWith('/en/') ? 'bg-primary/10 text-primary' : ''}`}
            >
              EN
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(pathname.replace(/^\/(en|zh)\//, '/zh/') || '/zh/')}
              className={`cursor-pointer rounded-full ${pathname.startsWith('/zh/') ? 'bg-primary/10 text-primary' : ''}`}
            >
              中
            </Button>
          </div>
          
          {/* 主题切换按钮 */}
          <div className="cursor-pointer transition-transform duration-200 hover:scale-105">
            <ThemeToggle />
          </div>

          {isLoggedIn ? (
            // 登录状态显示用户头像
            <div className="flex items-center gap-3">
              <Link href="/profile" className="cursor-pointer">
                {user?.photo ? (
                  // 如果有头像图片，显示图片
                  <img
                    src={user.photo}
                    alt={`${user.username}的头像`}
                    className="w-10 h-10 rounded-full object-cover transition-all duration-200 hover:scale-110"
                  />
                ) : (
                  // 如果没有头像图片，显示彩色首字母头像
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg transition-all duration-200 hover:scale-110">
                    {user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </Link>
            </div>
          ) : (
            // 未登录状态显示登录按钮
            <Link href="/login" className="w-full">
              <Button
                variant="default"
                size="sm"
                className="cursor-pointer rounded-full transition-all duration-200 hover:scale-105"
              >
                {t('login')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
