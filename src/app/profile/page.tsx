"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileUpdateSchema } from "@/lib/schemas/auth";
import { useAuthStore } from "@/lib/store/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { isLoggedIn, user, updateUser } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    nickname?: string;
    phone?: string;
    gender?: string;
    bio?: string;
  }>({});
  const t = useTranslations();

  // 如果用户未登录，重定向到登录页面
  useEffect(() => {
    if (!isLoggedIn || !user) {
      router.push("/login");
    }
  }, [isLoggedIn, user, router]);

  // 表单提交处理函数，作为form action使用
  const handleUpdateProfile = async (formData: FormData) => {
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});

    try {
      // 从FormData中获取表单数据
      const username = formData.get("username") as string;
      const email = formData.get("email") as string;
      const nickname = formData.get("nickname") as string;
      const phone = formData.get("phone") as string;
      const gender = formData.get("gender") as string;
      const bio = formData.get("bio") as string;

      // 客户端验证表单数据
      profileUpdateSchema.parse({
        username,
        email,
        nickname,
        phone,
        gender,
        bio,
      });

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, nickname, phone, gender, bio }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新失败");
      }

      // 更新本地用户信息
      updateUser({ username, email, nickname, phone, gender, bio });

      setSuccessMessage("用户信息更新成功");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "ZodError") {
        // 处理zod验证错误
        const fieldErrors: {
          username?: string;
          email?: string;
          nickname?: string;
          phone?: string;
          gender?: string;
          bio?: string;
        } = {};
        // 正确处理ZodError类型
        const zodError = err as unknown as {
          errors: { path: string[]; message: string }[];
        };
        if (zodError.errors) {
          zodError.errors.forEach(error => {
            if (error.path[0] === "username") {
              fieldErrors.username = error.message;
            } else if (error.path[0] === "email") {
              fieldErrors.email = error.message;
            } else if (error.path[0] === "nickname") {
              fieldErrors.nickname = error.message;
            } else if (error.path[0] === "phone") {
              fieldErrors.phone = error.message;
            } else if (error.path[0] === "gender") {
              fieldErrors.gender = error.message;
            } else if (error.path[0] === "bio") {
              fieldErrors.bio = error.message;
            }
          });
        }
        setFieldErrors(fieldErrors);
      } else {
        setErrorMessage(err instanceof Error ? err.message : "发生未知错误");
      }
    }
  };

  // 表单状态组件
  function SubmitButton() {
    const { pending } = useFormStatus();

    return (
      <Button type="submit" disabled={pending} className="cursor-pointer">
        {pending ? t("updateButtonPending") : t("updateButton")}
      </Button>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="min-w-[280px] md:min-w-[600px] max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

        <form
          action={handleUpdateProfile}
          className="space-y-6 p-6 bg-background border border-border rounded-lg shadow-sm"
        >
          {successMessage && (
            <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded-md text-sm">
              {t("success")}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-md text-sm">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="user_id" className="lg:pr-4 text-right">
                {t("userId")}
              </Label>
              <Input
                id="user_id"
                type="text"
                value={user.user_id}
                disabled
                className="bg-muted cursor-not-allowed lg:col-span-2"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="email" className="lg:pr-4 text-right">
                {t("email")}
              </Label>
              <div className="lg:col-span-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  className={`cursor-pointer ${fieldErrors.email ? "border-red-500" : "border-border"}`}
                />
                {fieldErrors.email && (
                  <p className="text-red-500 text-sm">{fieldErrors.email}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="username" className="lg:pr-4 text-right">
                {t("username")}
              </Label>
              <div className="lg:col-span-2">
                <Input
                  id="username"
                  name="username"
                  type="text"
                  defaultValue={user.username}
                  className={`cursor-pointer ${fieldErrors.username ? "border-red-500" : "border-border"}`}
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-sm">{fieldErrors.username}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="nickname" className="lg:pr-4 text-right">
                {t("nickname")}
              </Label>
              <div className="lg:col-span-2">
                <Input
                  id="nickname"
                  name="nickname"
                  type="text"
                  defaultValue={user.nickname || ""}
                  className={`cursor-pointer ${fieldErrors.nickname ? "border-red-500" : "border-border"}`}
                />
                {fieldErrors.nickname && (
                  <p className="text-red-500 text-sm">{fieldErrors.nickname}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="phone" className="lg:pr-4 text-right">
                {t("phone")}
              </Label>
              <div className="lg:col-span-2">
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  defaultValue={user.phone || ""}
                  className={`cursor-pointer ${fieldErrors.phone ? "border-red-500" : "border-border"}`}
                />
                {fieldErrors.phone && (
                  <p className="text-red-500 text-sm">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-center">
              <Label htmlFor="gender" className="lg:pr-4 text-right">
                {t("gender")}
              </Label>
              <div className="lg:col-span-2">
                <Input
                  id="gender"
                  name="gender"
                  type="text"
                  defaultValue={user.gender || ""}
                  className={`cursor-pointer ${fieldErrors.gender ? "border-red-500" : "border-border"}`}
                />
                {fieldErrors.gender && (
                  <p className="text-red-500 text-sm">{fieldErrors.gender}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-start">
              <Label htmlFor="bio" className="lg:pr-4 text-right pt-2">
                {t("bio")}
              </Label>
              <div className="lg:col-span-2">
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={user.bio || ""}
                  className={`w-full min-h-[100px] p-2 border rounded-md cursor-pointer ${fieldErrors.bio ? "border-red-500" : "border-border"}`}
                  rows={4}
                />
                {fieldErrors.bio && (
                  <p className="text-red-500 text-sm">{fieldErrors.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              className="cursor-pointer"
            >
              {t("cancelButton")}
            </Button>
            <SubmitButton />
          </div>
        </form>
      </div>
    </div>
  );
}
