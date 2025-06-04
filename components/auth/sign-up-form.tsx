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

export default function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  
  const { signUp, signInWithGoogle, isDemoMode } = useAuthStore();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDemoMode(false);

    // Validate password match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      console.log("Attempting to sign up...");
      await signUp(email, password, name);
      console.log("Sign up successful, redirecting to dashboard...");
      
      // Check if we're in demo mode
      const currentState = useAuthStore.getState();
      setDemoMode(currentState.isDemoMode);
      
      // Force a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to sign up:", error);
      // Check if it's a Firebase error that we can give more specific info about
      if (error instanceof Error) {
        if (error.message.includes('auth/email-already-in-use')) {
          setError("This email is already in use. Please use another email or sign in.");
        } else if (error.message.includes('auth/network-request-failed')) {
          setError("Network error. Please check your internet connection.");
          setDemoMode(true);
        } else if (error.message.includes('auth/invalid-email')) {
          setError("Invalid email address. Please enter a valid email.");
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
        setError("Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError("");
    setDemoMode(false);

    try {
      console.log("Attempting to sign up with Google...");
      await signInWithGoogle();
      console.log("Google sign up successful, redirecting to dashboard...");
      
      // Check if we're in demo mode
      const currentState = useAuthStore.getState();
      setDemoMode(currentState.isDemoMode);
      
      // Force a small delay to ensure auth state is updated
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Failed to sign up with Google:", error);
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
        setError("Failed to sign up with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your details to create an account
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
        
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <FiLoader className="mr-2 h-4 w-4 animate-spin" /> : null}
            Sign Up
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
          onClick={handleGoogleSignUp}
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
          Already have an account?{" "}
          <Link href="/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
} 