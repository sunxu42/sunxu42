import { Geist, Geist_Mono } from "next/font/google";
import { getServerLocale } from "@/i18n";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import ClientHtml from "@/components/ClientHtml";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import HeaderWrapper from "./header-wrapper";

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
  const locale = await getServerLocale();
  const messages = await getMessages({ locale });

  return (
    <ClientHtml>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          themes={["light", "dark"]}
          disableTransitionOnChange={true}
          storageKey="my-custom-theme"
        >
          <NextIntlClientProvider locale={locale} messages={messages}>
            <HeaderWrapper />
            <main className="w-full max-w-7xl mx-auto flex justify-center px-4 sm:px-6">
              {children}
            </main>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </ClientHtml>
  );
}
