export const CacheKeys = {
  // 1. Cookie 专用 Key（服务端需读取/随请求发送）
  COOKIE: {
    // 语义化命名
    USER_TOKEN: "user:token", // 用户登录 Token（httpOnly）
    USER_ID: "user:id", // 用户 ID
    REMEMBER_ME: "user:remember", // 记住登录状态
  },
  // 2. Zustand 持久化专用 Key（仅客户端存储）
  STORAGE: {
    // 语义化命名，和业务状态对应
    APP_THEME: "app:theme", // 应用主题（对应 themeStore）
    APP_LOCALE: "app:locale", // 应用语言（对应 localeStore）
    USER_SETTINGS: "user:settings", // 用户偏好（对应 userStore）
  },
} as const;

// 导出类型，限制使用场景（核心：类型隔离）
export type CookieKey = (typeof CacheKeys.COOKIE)[keyof typeof CacheKeys.COOKIE];
export type StorageKey = (typeof CacheKeys.STORAGE)[keyof typeof CacheKeys.STORAGE];
