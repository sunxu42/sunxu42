import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

const locales = ['en', 'zh'] as const;

export default getRequestConfig(async () => {
  // 从Cookie获取语言，而非路由参数
  const cookieStore = await cookies();
  const userLocale = cookieStore.get('user-locale')?.value;
  
  // 确保locale是有效的，如果无效则使用默认值
  const validLocale = locales.includes(userLocale as any) ? userLocale : 'zh';

  return {
    locale: validLocale as string,
    messages: {
      ...(await import(`./locales/${validLocale}/login.json`)).default,
      ...(await import(`./locales/${validLocale}/profile.json`)).default,
      ...(await import(`./locales/${validLocale}/home.json`)).default,
    },
  };
});


