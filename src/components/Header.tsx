"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/auth";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLocaleStore } from "@/lib/store/locale";

export function Header() {
  const { isLoggedIn, user, logout } = useAuthStore();
  const t = useTranslations();
  const currentLocale = useLocale();
  const router = useRouter();
  const { setLocale } = useLocaleStore();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <header className="sticky flex justify-center top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6">
        {/* 应用名称 */}
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight text-primary">
            <Link href="/" className="cursor-pointer flex items-center gap-2 hover:text-primary/90 hover:scale-105 theme-toggle-transition">
              <span>sunxu42</span>
            </Link>
          </div>
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 语言切换 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const newLocale = currentLocale === 'en' ? 'zh' : 'en';
              // 更新Zustand store（会自动同步到localStorage和Cookie）
              setLocale(newLocale);
              // 刷新页面以确保所有组件都使用新的语言
              router.refresh();
            }}
            className="cursor-pointer rounded-full"
          >
            <span className="font-medium">{currentLocale.toUpperCase()}</span>
          </Button>
          
          {/* 主题切换按钮 */}
          <div className="hover:scale-105">
            <ThemeToggle />
          </div>

          {isLoggedIn ? (
            // 登录状态显示用户头像
            <div className="flex items-center gap-2">
              <Link href="/profile" className="cursor-pointer">
                {user?.photo ? (
                  // 如果有头像图片，显示图片
                  <img
                    src={user.photo}
                    alt={`${user.username}的头像`}
                    className="w-9 h-9 rounded-full object-cover transition-transform duration-200 hover:scale-110"
                  />
                ) : (
                  // 如果没有头像图片，显示彩色首字母头像
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg hover:scale-110">
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
                className="cursor-pointer rounded-full transition-transform duration-200 hover:scale-105"
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
