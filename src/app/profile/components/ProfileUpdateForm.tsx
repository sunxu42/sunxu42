"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileUpdateSchema } from "@/types/auth-schemas";
import { useRouter } from "next/navigation";

interface User {
  user_id: string;
  email: string;
  username: string;
  profile?: {
    nickname?: string;
    phone?: string;
    gender?: string;
    bio?: string;
  };
}

interface ProfileUpdateFormProps {
  user: User;
}

export function ProfileUpdateForm({ user }: ProfileUpdateFormProps) {
  const t = useTranslations();
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    
    // 从FormData中获取表单数据
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const nickname = formData.get("nickname") as string;
    const phone = formData.get("phone") as string;
    const gender = formData.get("gender") as string;
    const bio = formData.get("bio") as string;

    try {
      // 客户端验证表单数据
      ProfileUpdateSchema.parse({
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

      setSuccessMessage("用户信息更新成功");
      // 刷新页面以获取最新数据
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // 处理zod验证错误
        const errors: {
          username?: string;
          email?: string;
          nickname?: string;
          phone?: string;
          gender?: string;
          bio?: string;
        } = {};
        
        err.issues.forEach(issue => {
          const field = issue.path[0] as keyof typeof errors;
          if (field) {
            errors[field] = issue.message;
          }
        });
        
        setFieldErrors(errors);
      } else {
        setErrorMessage(err instanceof Error ? err.message : "发生未知错误");
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
            {fieldErrors.email && <p className="text-red-500 text-sm">{fieldErrors.email}</p>}
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
              defaultValue={user.username || ""}
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
              defaultValue={user.profile?.nickname || ""}
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
              defaultValue={user.profile?.phone || ""}
              className={`cursor-pointer ${fieldErrors.phone ? "border-red-500" : "border-border"}`}
            />
            {fieldErrors.phone && <p className="text-red-500 text-sm">{fieldErrors.phone}</p>}
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
              defaultValue={user.profile?.gender || ""}
              className={`cursor-pointer ${fieldErrors.gender ? "border-red-500" : "border-border"}`}
            />
            {fieldErrors.gender && <p className="text-red-500 text-sm">{fieldErrors.gender}</p>}
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
              defaultValue={user.profile?.bio || ""}
              className={`w-full min-h-[100px] p-2 border rounded-md cursor-pointer ${fieldErrors.bio ? "border-red-500" : "border-border"}`}
              rows={4}
            />
            {fieldErrors.bio && <p className="text-red-500 text-sm">{fieldErrors.bio}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          className="cursor-pointer"
          onClick={() => router.push("/")}
        >
          {t("cancelButton")}
        </Button>
        <Button type="submit" className="cursor-pointer">
          {t("updateButton")}
        </Button>
      </div>
    </form>
  );
}