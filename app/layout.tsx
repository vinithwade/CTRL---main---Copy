import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { RootLayout } from "@/components/layout/root-layout";
import AuthCheck from "@/components/auth/auth-check";
import { OfflineSupport } from "@/components/offline-support";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "CTRL - No-Code/Low-Code App Builder",
  description: "Design, build, and generate apps with no code.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OfflineSupport />
        <RootLayout>
          <AuthCheck>{children}</AuthCheck>
        </RootLayout>
        <Toaster />
      </body>
    </html>
  );
}
