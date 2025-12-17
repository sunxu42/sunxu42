import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme, isUserSet?: boolean) => void;
  isUserSet: boolean; // 标记是否为用户手动设置的主题
}

// 获取系统主题偏好
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeState>()(
  persist(
    set => ({
      // 服务器端始终使用light作为初始主题，客户端会在persist恢复时更新
      theme: "light",
      isUserSet: false, // 默认不是用户手动设置的

      toggleTheme: () =>
        set(state => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          return {
            theme: newTheme,
            isUserSet: true, // 用户手动切换主题
          };
        }),

      setTheme: (theme, isUserSet = false) =>
        set(() => {
          return {
            theme,
            isUserSet, // 允许指定是否为用户手动设置
          };
        }),
    }),
    {
      name: "theme-storage", // 本地存储的键名
      storage: createJSONStorage(() => localStorage), // 使用localStorage进行存储
    }
  )
);

// 添加一个初始化函数，用于在客户端组件挂载时设置正确的初始主题
export const initializeTheme = () => {
  if (typeof window === "undefined") return;

  console.log("Initializing theme...");

  const store = useThemeStore.getState();
  const storedTheme = localStorage.getItem("theme-storage");

  console.log("Stored theme:", storedTheme);

  // 检查存储的主题
  if (storedTheme) {
    try {
      const parsedTheme = JSON.parse(storedTheme);
      console.log("Parsed theme:", parsedTheme);

      // 更新store中的主题状态
      if (parsedTheme.theme) {
        console.log("Setting theme to:", parsedTheme.theme);
        store.setTheme(parsedTheme.theme, parsedTheme.isUserSet || false);
        console.log("Theme set successfully");
      }
    } catch (e) {
      console.error("Error parsing theme from localStorage:", e);
      // 如果解析失败，使用系统主题并保存
      const systemTheme = getSystemTheme();
      store.setTheme(systemTheme);
    }
  } else {
    console.log("No stored theme, using system theme");
    // 没有存储的主题，使用系统主题并保存
    const systemTheme = getSystemTheme();
    store.setTheme(systemTheme);
  }
};

// 监听系统主题变化，仅在用户未手动设置主题时生效
export const setupSystemThemeListener = () => {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleThemeChange = (e: MediaQueryListEvent) => {
    const newTheme = e.matches ? "dark" : "light";
    const store = useThemeStore.getState();
    // 只有在用户未手动设置主题时，才跟随系统主题变化
    if (!store.isUserSet) {
      store.setTheme(newTheme);
    }
  };

  mediaQuery.addEventListener("change", handleThemeChange);

  return () => {
    mediaQuery.removeEventListener("change", handleThemeChange);
  };
};
