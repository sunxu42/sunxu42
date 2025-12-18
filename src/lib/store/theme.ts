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

// 更新DOM主题类名
const updateDOMTheme = (theme: Theme) => {
  if (typeof window === "undefined") return;
  const documentElement = window.document.documentElement;
  if (theme === "dark") {
    documentElement.classList.add("dark");
  } else {
    documentElement.classList.remove("dark");
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // 服务器端始终使用light作为初始主题，客户端会在persist恢复时更新
      theme: "light",
      isUserSet: false, // 默认不是用户手动设置的

      toggleTheme: () =>
        set(state => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          // 更新DOM主题类名
          updateDOMTheme(newTheme);
          return {
            theme: newTheme,
            isUserSet: true, // 用户手动切换主题
          };
        }),

      setTheme: (theme, isUserSet = false) => {
        // 更新DOM主题类名
        updateDOMTheme(theme);
        set(() => ({
          theme,
          isUserSet, // 允许指定是否为用户手动设置
        }));
      },
    }),
    {
      name: "theme-storage", // 本地存储的键名
      storage: createJSONStorage(() => localStorage), // 使用localStorage进行存储
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined") return;
        
        // 设置DOM主题类名
        if (state?.theme) {
          updateDOMTheme(state.theme);
        } else {
          const systemTheme = getSystemTheme();
          useThemeStore.getState().setTheme(systemTheme);
        }
        
        // 监听系统主题变化，仅在用户未手动设置主题时生效
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleThemeChange = (e: MediaQueryListEvent) => {
          const newTheme = e.matches ? "dark" : "light";
          const storeState = useThemeStore.getState();
          // 只有在用户未手动设置主题时，才跟随系统主题变化
          if (!storeState.isUserSet) {
            storeState.setTheme(newTheme);
          }
        };
        
        mediaQuery.addEventListener("change", handleThemeChange);
        
        // 返回清理函数
        return () => {
          mediaQuery.removeEventListener("change", handleThemeChange);
        };
      },
    }
  )
);
