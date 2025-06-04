"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";
import { FcGoogle } from "react-icons/fc";
import { FiLoader } from "react-icons/fi";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  
  const { signIn, signInWithGoogle, isDemoMode } = useAuthStore();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoMode(false);

    try {
      console.log("Attempting to sign in...");
      await signIn(email, password);
      console.log("Sign in successful, redirecting to dashboard...");
      
      // Check if we're in demo mode
      const currentState = useAuthStore.getState();
      setDemoMode(currentState.isDemoMode);
      
      // Force a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to sign in:", error);
      // Check if it's a Firebase error that we can give more specific info about
      if (error instanceof Error) {
        if (error.message.includes('auth/user-not-found')) {
          setError("No account found with this email. Please sign up first.");
        } else if (error.message.includes('auth/wrong-password')) {
          setError("Incorrect password. Please try again or reset your password.");
        } else if (error.message.includes('auth/network-request-failed')) {
          setError("Network error. Please check your internet connection.");
          setDemoMode(true);
        } else if (error.message.includes('auth/too-many-requests')) {
          setError("Too many failed attempts. Please try again later or reset your password.");
        } else if (error.message.includes('Firebase Auth is in mock mode')) {
          setError("Using demo mode - Firebase is not properly configured");
          setDemoMode(true);
          // Still redirect them in demo mode after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setDemoMode(false);

    try {
      console.log("Attempting to sign in with Google...");
      await signInWithGoogle();
      console.log("Google sign in successful, redirecting to dashboard...");
      
      // Check if we're in demo mode
      const currentState = useAuthStore.getState();
      setDemoMode(currentState.isDemoMode);
      
      // Force a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to sign in with Google:", error);
      // Check if it's a Firebase error that we can give more specific info about
      if (error instanceof Error) {
        if (error.message.includes('auth/popup-closed-by-user')) {
          setError("Google sign-in was cancelled. Please try again.");
        } else if (error.message.includes('auth/network-request-failed')) {
          setError("Network error. Please check your internet connection.");
          setDemoMode(true);
        } else if (error.message.includes('Firebase Auth is in mock mode')) {
          setError("Using demo mode - Firebase is not properly configured");
          setDemoMode(true);
          // Still redirect them in demo mode after 2 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setError(error.message);
        }
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isDemoMode && (
          <Alert className="mb-4">
            <AlertDescription>
              Running in demo mode. All authentication is simulated.
            </AlertDescription>
          </Alert>
        )}
        
        {demoMode && (
          <Alert className="mb-4">
            <AlertDescription>
              Using demo mode due to Firebase configuration issues. Redirecting to dashboard...
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <FiLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign In
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <FiLoader className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FcGoogle className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 