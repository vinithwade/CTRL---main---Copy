"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-8">Welcome to CTRL</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Design Mode</h2>
          <p className="text-muted-foreground mb-4">
            Create your application&apos;s interface using our intuitive design tools.
          </p>
          <Button onClick={() => router.push('/design')}>
            Open Design Mode
          </Button>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Logic Mode</h2>
          <p className="text-muted-foreground mb-4">
            Build your application&apos;s logic using our visual flow editor.
          </p>
          <Button onClick={() => router.push('/logic')}>
            Open Logic Mode
          </Button>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Code Mode</h2>
          <p className="text-muted-foreground mb-4">
            View and edit the generated code for your application.
          </p>
          <Button onClick={() => router.push('/code')}>
            Open Code Mode
          </Button>
        </div>
      </div>
    </div>
  );
} 