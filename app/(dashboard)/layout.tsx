"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const [initials, setInitials] = useState("");

  useEffect(() => {
    if (user?.displayName) {
      const nameParts = user.displayName.split(" ");
      setInitials(
        nameParts
          .map((part) => part[0])
          .join("")
          .toUpperCase()
      );
    } else if (user?.email) {
      setInitials(user.email[0].toUpperCase());
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 bg-background border-b">
        <div className="container h-16 flex items-center justify-between px-4">
          <Link className="flex items-center space-x-2" href="/dashboard">
            <span className="text-2xl font-bold">CTRL</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className={
                pathname === "/dashboard"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/settings"
              className={
                pathname === "/settings"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              Settings
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => window.location.href = "/dashboard"}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 bg-muted/20">{children}</main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col sm:flex-row items-center justify-between py-4 space-y-2 sm:space-y-0 px-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CTRL Platform. All rights reserved.
          </p>
          <nav className="flex items-center space-x-4 text-xs text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
} 