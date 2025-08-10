
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'MediShift: AI Resident Scheduler',
  description: 'AI-powered scheduling for neurosurgery residents.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased"
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
