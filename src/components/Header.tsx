"use client";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky flex justify-center top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="w-full flex h-16 items-center justify-between px-4 sm:px-6">
        {/* 应用名称 */}
        <div className="flex items-center gap-2">
          <div className="text-xl font-bold tracking-tight text-primary transition-colors duration-200 hover:text-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <span>sunxu42</span>
            </Link>
          </div>
        </div>

        {/* 右侧功能区 */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* 主题切换按钮 */}
          <div className="transition-transform duration-200 hover:scale-105">
            <ThemeToggle />
          </div>

          {/* 登录按钮 */}
          <Link href="/login" className="w-full">
            <Button
              variant="default"
              size="sm"
              className="cursor-pointer rounded-full transition-all duration-200 hover:scale-105"
            >
              登录
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
