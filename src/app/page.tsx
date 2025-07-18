
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page will now act as a guard.
// For this step, we'll just redirect to the login page.
// In future steps, we'll check for an authenticated user here.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
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
