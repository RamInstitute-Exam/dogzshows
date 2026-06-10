import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "JuztDog - India's Premium Dog Community & Marketplace",
  description: "A world-class platform to discover, adopt, and manage dog profiles, integrated with AI tools, social community, and professional pet services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] font-sans text-[var(--foreground)] selection:bg-brand-orange selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col relative z-0">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
