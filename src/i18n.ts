import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'zh'];

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound();

  return {
    messages: {
      ...(await import(`./locales/${locale}/login.json`)).default,
      ...(await import(`./locales/${locale}/profile.json`)).default,
      ...(await import(`./locales/${locale}/home.json`)).default,
    },
  };
});