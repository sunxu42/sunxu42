"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  user_id: string;
  email: string;
  username: string;
  nickname?: string;
  avatar_url?: string;
  phone?: string;
  gender?: string;
  bio?: string;
  photo?: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isRefreshing: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  refreshToken: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isRefreshing: false,
      login: user => set({ user, isLoggedIn: true }),
      logout: () => {
        // 清除cookie中的token和refresh token
        if (typeof document !== "undefined") {
          document.cookie =
            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie =
            "refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
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
            set({ user: data.user, isLoggedIn: true });
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 从cookie中获取token
const getTokenFromCookie = (): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(^|;)\s*token\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

// 添加一个初始化函数，用于在客户端组件挂载时检查用户登录状态
export const initializeAuth = async () => {
  if (typeof window === "undefined") return;

  // 首先检查cookie中是否有token
  const token = getTokenFromCookie();
  if (!token) {
    // 如果没有token，确保用户状态是登出的
    const store = useAuthStore.getState();
    store.logout();
    return;
  }

  try {
    // 如果有token，调用API获取完整的用户profile信息
    const response = await fetch("/api/profile", {
      method: "GET",
      credentials: "include", // 包含cookie
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.user) {
        // 更新auth store
        const store = useAuthStore.getState();
        store.login(data.user);
      } else {
        // 如果API返回错误，清除用户信息和token
        const store = useAuthStore.getState();
        store.logout();
      }
    } else {
      // 如果API请求失败，清除用户信息和token
      const store = useAuthStore.getState();
      store.logout();
    }
  } catch (error) {
    console.error("Error initializing auth:", error);
    // 如果发生错误，确保用户状态是登出的
    const store = useAuthStore.getState();
    store.logout();
  }
};
