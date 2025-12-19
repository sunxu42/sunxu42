import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/constants";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

// 获取浏览器语言偏好
const getBrowserLocale = (): Locale => {
  if (typeof window === "undefined") return "zh";
  const browserLang = window.navigator.language.toLowerCase();
  if (browserLang.startsWith("en")) return "en";
  if (browserLang.startsWith("zh")) return "zh";
  return "zh"; // 默认中文
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: "zh", // 服务器端默认中文
      setLocale: (locale: Locale) => {
        set({ locale });
        // 同步更新Cookie
        if (typeof window !== "undefined") {
          document.cookie = `user-locale=${locale}; path=/; max-age=31536000; ${process.env.NODE_ENV === "production" ? "secure;" : ""} sameSite=lax`;
        }
      },
    }),
    {
      name: "locale-storage", // 本地存储的键名
      storage: createJSONStorage(() => localStorage), // 使用localStorage进行存储
      // 在首次加载时，如果没有存储的语言，则使用浏览器语言
      onRehydrateStorage: () => state => {
        if (typeof window === "undefined" || state !== undefined) return;

        // 只有当state为undefined（即首次加载且没有存储的语言）时，才使用浏览器语言
        const browserLocale = getBrowserLocale();
        useLocaleStore.getState().setLocale(browserLocale);
      },
    }
  )
);
