import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SearchProvider } from "@/context/SearchContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pinterest Pro - Discover & Save Ideas",
  description: "A premium Pinterest-like experience with private notes, carousels, and offline browsing.",
  icons: {
    icon: "/image.png",
  },
};

import { SavedProvider } from "@/context/SavedContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full font-sans">
        <AuthProvider>
          <SavedProvider>
            <SearchProvider>
              {children}
            </SearchProvider>
          </SavedProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
