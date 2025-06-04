import SignInForm from "@/components/auth/sign-in-form";
import Image from "next/image";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center px-4 lg:px-6 border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-xl font-bold">CTRL</span>
          <span className="sr-only">CTRL Platform</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="grid lg:grid-cols-2 gap-10 w-full max-w-5xl items-center">
          <div className="flex flex-col space-y-6 p-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">
                Enter your credentials to access your no-code/low-code projects.
              </p>
            </div>
            <SignInForm />
          </div>
          <div className="hidden lg:flex flex-col justify-center items-center p-4 bg-muted rounded-lg">
            <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=2064&auto=format&fit=crop"
                alt="App screenshot"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-center">Seamless No-Code & Low-Code Development</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Design, build logic, and generate code - all in one platform.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 