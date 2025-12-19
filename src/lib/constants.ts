// 支持的语言列表
export const SUPPORTED_LOCALES = ["en", "zh"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// 语言存储常量
export const LOCALE_STORAGE_KEY = "user-locale";
