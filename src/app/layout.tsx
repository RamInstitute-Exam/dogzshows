import React, { Suspense } from 'react';
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from '@/components/providers/QueryProvider';
import { cn } from "@/lib/utils";
import AuthModal from '@/components/auth/AuthModal';
import { Toaster } from 'sonner';
import { LoaderProvider } from '@/components/common/loader/LoaderProvider';
import ScrollPreservationProvider from '@/components/providers/ScrollPreservationProvider';
import PublicLayoutWrapper from '@/components/layout/PublicLayoutWrapper';

export const metadata: Metadata = {
  metadataBase: new URL('https://juzdog.co'),
  title: "JUZDOG",
  description: "JUZDOG is a premium canine photography brand that covers dog shows across India. We specialize in professional photography, 4K live coverage, podium photography, outdoor photoshoots, and capturing memorable moments with exceptional quality and creativity.",
  keywords: ['dog show', 'KCI', 'kennel club', 'FCI', 'dog competitions'],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'JUZDOG',
    description: 'Premium canine photography and dog show management platform across India.',
    url: 'https://juzdog.co',
    siteName: 'JUZDOG',
    locale: 'en_IN',
    type: 'website',
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased")} suppressHydrationWarning>
      <body className="min-h-[100vh] flex flex-col bg-background text-foreground selection:bg-foreground selection:text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <Suspense fallback={null}>
              <LoaderProvider>
                <QueryProvider>
                  <PublicLayoutWrapper>
                    {children}
                  </PublicLayoutWrapper>
                  <AuthModal />
                  <Toaster position="top-right" richColors />
                </QueryProvider>
              </LoaderProvider>
            </Suspense>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
