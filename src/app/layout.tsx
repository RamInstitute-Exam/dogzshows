import React, { Suspense } from 'react';
import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from '@/components/providers/QueryProvider';
import { cn } from "@/lib/utils";
import AuthModal from '@/components/auth/AuthModal';
import { Toaster } from 'sonner';
import { LoaderProvider } from '@/components/common/loader/LoaderProvider';
import ScrollPreservationProvider from '@/components/providers/ScrollPreservationProvider';
import PublicLayoutWrapper from '@/components/layout/PublicLayoutWrapper';

const mulish = Mulish({ 
  subsets: ["latin"], 
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-mulish",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JUZDOG",
  description: "A world-class platform to discover, adopt, and manage dog profiles, integrated with AI tools, social community, and professional pet services.",
  keywords: ['dog show', 'KCI', 'kennel club', 'FCI', 'dog competitions'],
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
    <html lang="en" className={cn("h-full", "antialiased", mulish.variable, "font-sans")} suppressHydrationWarning>
      <body className="min-h-[100vh] flex flex-col bg-background font-sans text-foreground selection:bg-foreground selection:text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <Suspense fallback={null}>
              <ScrollPreservationProvider />
            </Suspense>
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
