import { useAuthStore } from "@/lib/store/auth";
import { useEffect } from "react";

/**
 * Token刷新钩子，用于自动检测和刷新过期的token
 * 每3.5小时检查一次token是否需要刷新
 */
export function useTokenRefresh() {
  const refreshToken = useAuthStore(state => state.refreshToken);
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn) return;

    // 组件挂载时检查一次token
    const checkToken = async () => {
      try {
        await refreshToken();
      } catch (error) {
        console.error("初始token检查失败:", error);
      }
    };

    checkToken();

    // 每3.5小时自动检查一次token
    const refreshInterval = setInterval(
      () => {
        try {
          refreshToken();
        } catch (error) {
          console.error("定时token刷新失败:", error);
        }
      },
      3.5 * 60 * 60 * 1000
    ); // 3.5小时

    // 组件卸载时清除定时器
    return () => clearInterval(refreshInterval);
  }, [isLoggedIn, refreshToken]);
}

/**
 * API请求包装器，用于自动处理token过期并刷新
 * @param requestFn API请求函数
 */
export function withTokenRefresh<T>(requestFn: () => Promise<T>): Promise<T> {
  const refreshToken = useAuthStore.getState().refreshToken;
  const logout = useAuthStore.getState().logout;

  return new Promise((resolve, reject) => {
    const attemptRequest = async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error: unknown) {
        // 检查是否是token过期错误
        const errorObj = error as {
          response?: { status: number };
          message?: string;
        };
        if (errorObj.response?.status === 401 || errorObj.message?.includes("token")) {
          try {
            // 尝试刷新token
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              // 刷新成功后重试请求
              const result = await requestFn();
              resolve(result);
            } else {
              // 刷新失败，执行登出
              logout();
              reject(new Error("Token刷新失败，已执行登出"));
            }
          } catch {
            // 刷新过程中发生错误
            logout();
            reject(new Error("Token刷新失败，已执行登出"));
          }
        } else {
          // 其他错误，直接返回
          reject(error);
        }
      }
    };

    attemptRequest();
  });
}
