"use client";

import { NextIntlClientProvider } from "next-intl";
import { ReactNode } from "react";

interface ClientProviderProps {
  children: ReactNode;
  locale: string;
  messages: Record<string, Record<string, string>>;
}

export function ClientProvider({ children, locale, messages }: ClientProviderProps) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
