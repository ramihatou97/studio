
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page will now act as a guard.
// We will redirect to the main app page.
// In a real app, this would check for an authenticated user first.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/app');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}
