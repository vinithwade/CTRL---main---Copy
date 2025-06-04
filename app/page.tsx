import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <span className="text-2xl font-bold">CTRL</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Features
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            Pricing
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/signin">
            Sign In
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Bi-directional No-Code/Low-Code Development
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Design, build logic, and generate code in one seamless platform. Real-time sync between 
                    visual design, node-based logic, and editable code.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full">Get Started</Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="outline" className="w-full">Sign In</Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-muted">
                  {/* Replace with actual preview image or animation of the app */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-indigo-700 opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="space-y-4 text-center">
                      <h2 className="text-2xl font-bold">Platform Preview</h2>
                      <p className="text-lg">Design. Logic. Code.</p>
                      <div className="flex justify-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">UI</div>
                        <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">Logic</div>
                        <div className="h-16 w-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">Code</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Everything you need to build powerful applications without writing a single line of code.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 w-full max-w-5xl">
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-card">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Figma-like Design</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Drag and drop UI components with auto-layout, constraints and responsive design.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-card">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <path d="M14 4c0-1.1.9-2 2-2" />
                      <path d="M20 2c1.1 0 2 .9 2 2" />
                      <path d="M22 8c0 1.1-.9 2-2 2" />
                      <path d="M16 10c-1.1 0-2-.9-2-2" />
                      <path d="M4 18c-1.1 0-2-.9-2-2" />
                      <path d="M2 12c0-1.1.9-2 2-2" />
                      <path d="M8 10c1.1 0 2 .9 2 2" />
                      <path d="M10 16c0 1.1-.9 2-2 2" />
                      <line x1="2" x2="22" y1="12" y2="12" />
                      <line x1="12" x2="12" y1="2" y2="22" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Node-based Logic</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Create complex application logic using a visual flow-based editor.
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-2 border rounded-lg p-6 bg-card">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-6 w-6 text-primary"
                    >
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold">Code Generation</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Export to multiple platforms and languages with production-ready code.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to start building?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Join thousands of developers and designers using CTRL to accelerate their workflow.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full">Get Started for Free</Button>
                </Link>
                <Link href="#">
                  <Button size="lg" variant="outline" className="w-full">Book a Demo</Button>
                </Link>
              </div>
            </div>
        </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2025 CTRL Platform. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
