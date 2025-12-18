'use client';

import { useLocaleStore } from '@/lib/store/locale';

interface ClientHtmlProps {
  children: React.ReactNode;
}

export default function ClientHtml({ children }: ClientHtmlProps) {
  // 直接使用Zustand store中的locale值
  const { locale } = useLocaleStore();

  return (
    <html lang={locale} className="scroll-smooth" data-scroll-behavior="smooth">
      {children}
    </html>
  );
}
