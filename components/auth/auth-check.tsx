"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter, usePathname } from "next/navigation";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const { user, isLoading, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Only public paths that don't require auth
  const publicPaths = ["/", "/signin", "/signup"];

  useEffect(() => {
    try {
      // Check authentication status
      checkAuth();
    } catch (error) {
      console.error("Auth check error:", error);
      // Continue with demo mode if Firebase setup fails
    }
  }, [checkAuth]);

  // Redirect to dashboard if logged in and on an auth page
  useEffect(() => {
    if (!isLoading && user && (pathname === "/signin" || pathname === "/signup")) {
      console.log("User is authenticated and on auth page, redirecting to dashboard");
      router.push("/dashboard");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If we're on a public path, render normally
  if (publicPaths.includes(pathname)) {
    return <>{children}</>;
  }

  // If not on a public path and not logged in, redirect to signin
  if (!user) {
    // If in development or Firebase isn't set up properly, continue in demo mode
    if (process.env.NODE_ENV === "development" || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('placeholder')) {
      console.log("Running in demo mode - bypassing authentication");
      return <>{children}</>;
    }
    
    // In production with proper Firebase setup, redirect to sign in
    console.log("User not authenticated, redirecting to signin");
    router.push("/signin");
    return null;
  }

  return <>{children}</>;
} 