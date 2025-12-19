"use client";

import { z } from "zod";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// User Zod Schema
export const userSchema = z.object({
  user_id: z.string(),
  email: z.string().email(),
  username: z.string(),
  nickname: z.string().optional(),
  avatar_url: z.string().optional(),
  phone: z.string().optional(),
  gender: z.string().optional(),
  bio: z.string().optional(),
  photo: z.string().optional(),
});

// User Type inferred from Zod Schema
export type User = z.infer<typeof userSchema>;

// Refresh Token Response Zod Schema
const refreshTokenResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: userSchema,
});

// Profile API Response Zod Schema
const profileResponseSchema = z.object({
  success: z.boolean(),
  user: userSchema,
});

// AuthState Zod Schema (for state properties validation)
export const authStateSchema = z.object({
  user: userSchema.nullable(),
  isLoggedIn: z.boolean(),
  isRefreshing: z.boolean(),
});

// AuthState interface
interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
  clearLoginState: () => void;
  checkAuthStatus: () => Promise<void>;
}

// 检查用户认证状态
const checkAuthStatus = async () => {
  if (typeof window === "undefined") return;

  try {
    // 直接调用API检查token有效性，浏览器会自动包含cookie
    const response = await fetch("/api/profile", {
      method: "GET",
      credentials: "include", // 包含cookie
    });

    if (response.ok) {
      const data = await response.json();
      // Validate response data with Zod
      try {
        const validatedData = profileResponseSchema.parse(data);
        if (validatedData.success) {
          // 更新auth store - token有效
          useAuthStore.getState().login(validatedData.user);
        } else {
          // API返回错误，token可能无效
          useAuthStore.getState().clearLoginState();
        }
      } catch (validationError) {
        console.error("Profile response validation failed:", validationError);
        // 响应格式错误
        useAuthStore.getState().clearLoginState();
      }
    } else {
      // API请求失败，token可能无效或已过期
      useAuthStore.getState().clearLoginState();
    }
  } catch (error) {
    console.error("Error checking auth status:", error);
    // 网络错误等
    useAuthStore.getState().clearLoginState();
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isRefreshing: false,
      login: user => set({ user, isLoggedIn: true }),
      logout: () => {
        // 清除cookie中的token和refresh token
        if (typeof window !== "undefined") {
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
        set({ user: null, isLoggedIn: false });
      },
      clearLoginState: () => {
        // 只清除登录状态，不清除localStorage数据
        set({ user: null, isLoggedIn: false });
      },
      updateUser: updatedUser =>
        set(state => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        })),
      refreshToken: async () => {
        const state = get();
        if (state.isRefreshing) return false;

        set({ isRefreshing: true });

        try {
          const response = await fetch("/api/refresh-token", {
            method: "POST",
            credentials: "include", // 包含cookies
          });

          if (response.ok) {
            const data = await response.json();
            // Validate response data with Zod
            const validatedData = refreshTokenResponseSchema.parse(data);
            set({ user: validatedData.user, isLoggedIn: true });
            return true;
          } else {
            // 刷新失败，执行登出
            get().logout();
            return false;
          }
        } catch (error) {
          console.error("Token刷新失败:", error);
          get().logout();
          return false;
        } finally {
          set({ isRefreshing: false });
        }
      },
      // 检查认证状态的方法
      checkAuthStatus: async () => {
        await checkAuthStatus();
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      // 在状态恢复后检查认证状态
      onRehydrateStorage: () => state => {
        // 只在客户端检查认证状态
        if (typeof window !== "undefined") {
          // 无论是否有存储的状态，都检查当前token的有效性
          checkAuthStatus();
        }
      },
    }
  )
);
