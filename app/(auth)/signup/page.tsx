import SignUpForm from "@/components/auth/sign-up-form";
import Image from "next/image";
import Link from "next/link";

export default function SignUpPage() {
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
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground">
                Sign up to start building your no-code/low-code applications.
              </p>
            </div>
            <SignUpForm />
          </div>
          <div className="hidden lg:flex flex-col justify-center items-center p-4 bg-muted rounded-lg">
            <div className="relative w-full max-w-md aspect-video overflow-hidden rounded-lg shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt="App screenshot"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-center">Design to Code in Minutes</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Build visually with our editor and export production-ready code instantly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 