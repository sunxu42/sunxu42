"use client";

import { useRouter } from "next/navigation";
import { loginRequestSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/auth";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// 从cookie中获取token
const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^|;)\s*token\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState("");
  const login = useAuthStore(state => state.login);
  const t = useTranslations();

  // 检查是否有token，如果有则跳转到home页面
  useEffect(() => {
    const checkAuth = async () => {
      // 首先检查cookie
      const token = getTokenFromCookie();
      if (token) {
        router.push("/home");
        return;
      }

      // 然后检查auth store
      const isLoggedIn = useAuthStore.getState().isLoggedIn;
      if (isLoggedIn) {
        router.push("/home");
        return;
      }

      // 最后尝试检查auth状态（处理异步初始化的情况）
      await useAuthStore.getState().checkAuthStatus();

      // 再次检查登录状态
      const updatedIsLoggedIn = useAuthStore.getState().isLoggedIn;
      if (updatedIsLoggedIn) {
        router.push("/home");
      }
    };

    checkAuth();
  }, [router]);

  // 表单提交处理函数
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    try {
      // 客户端验证表单数据
      loginRequestSchema.parse({ email, password });

      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "登录失败");
      }

      // 登录成功，使用auth store保存用户信息
      login(data.user);

      // 跳转到首页
      router.push("/home");
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // 处理zod验证错误
        const errors: { email?: string; password?: string } = {};
        err.issues.forEach((error: z.ZodIssue) => {
          if (error.path[0] === "email") {
            errors.email = error.message;
          } else if (error.path[0] === "password") {
            errors.password = error.message;
          }
        });
        setFieldErrors(errors);
      } else {
        setError(err instanceof Error ? err.message : "发生未知错误");
      }
    }
  };

  return (
    <div className="min-w-[280px] md:min-w-[480px] max-w-[480px] flex min-h-screen items-center justify-center p-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="p-2 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t("email")}
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${fieldErrors.password ? "border-red-500" : "border-gray-300"}`}
              />
              {fieldErrors.password && (
                <p className="text-red-500 text-sm">{fieldErrors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full cursor-pointer">
              {t("loginButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
