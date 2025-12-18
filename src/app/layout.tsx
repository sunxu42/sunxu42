import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeaderWrapper from "./header-wrapper";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import ClientHtml from '@/components/ClientHtml';
import { cookies } from 'next/headers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "sunxu42",
  description: "A personal website of sunxu42",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 从Cookie获取语言偏好，默认中文
  const cookieStore = await cookies();
  const userLocale = cookieStore.get('user-locale')?.value;
  const locale = ['en', 'zh'].includes(userLocale as any) ? userLocale : 'zh';
  
  // 加载对应语言的翻译文案
  const messages = await getMessages({ locale });

  return (
    <ClientHtml>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <NextIntlClientProvider messages={messages}>
          <HeaderWrapper />
          <main className="min-h-screen w-full flex justify-center px-4 sm:px-6">
            {children}
          </main>
        </NextIntlClientProvider>
      </body>
    </ClientHtml>
  );
}
