import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import QueryProvider from '@/components/providers/QueryProvider';
import { cn } from "@/lib/utils";
import AuthModal from '@/components/auth/AuthModal';
import { Toaster } from 'sonner';
import { GlobalLoaderProvider } from '@/components/shared/GlobalLoader';

const mulish = Mulish({ 
  subsets: ["latin"], 
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: "--font-mulish",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "JuztDog - India's Premium Dog Community & Marketplace",
  description: "A world-class platform to discover, adopt, and manage dog profiles, integrated with AI tools, social community, and professional pet services.",
  keywords: ['dog show', 'KCI', 'kennel club', 'FCI', 'dog competitions'],
};

import { ThemeProvider } from '@/components/providers/ThemeProvider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "antialiased", mulish.variable, "font-sans")} suppressHydrationWarning>
      <body className="min-h-[100vh] flex flex-col bg-background font-sans text-foreground selection:bg-brand-orange selection:text-foreground overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <GlobalLoaderProvider>
              <QueryProvider>
                {children}
                <AuthModal />
                <Toaster position="top-right" richColors />
              </QueryProvider>
            </GlobalLoaderProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
