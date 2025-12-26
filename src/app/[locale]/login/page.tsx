"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [error, setError] = useState("");
  const t = useTranslations("login");

  // 检查URL中的错误参数
  const errorParam = searchParams.get("error");
  if (errorParam && !error) {
    setError(
      errorParam === "CredentialsSignin" ? t("errors.invalidCredentials") : t("errors.loginFailed")
    );
  }

  // 表单提交处理函数
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    // 动态创建带翻译的验证schema
    const loginSchema = z.object({
      email: z.email(t("errors.invalidEmail")),
      password: z.string().min(6, t("errors.passwordTooShort")),
    });

    try {
      // 客户端验证表单数据
      loginSchema.parse({ email, password });

      // 使用next-auth的signIn函数
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("errors.invalidCredentials"));
      } else {
        // 登录成功，跳转到首页
        router.push("/home");
      }
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
        setError(err instanceof Error ? err.message : t("errors.unknownError"));
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
