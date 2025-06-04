"use client";

import React from "react";
import { TitleBar } from "@/components/ui/title-bar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <TitleBar />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
} 