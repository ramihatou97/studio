
"use client";

import { MediShiftLogo } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-md relative">
        <div className="flex justify-center items-center gap-4 mb-8">
            <MediShiftLogo className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                MediShift
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                AI Neurosurgery Resident Scheduler
              </p>
            </div>
        </div>
        <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg">
            {children}
        </div>
       </div>
    </div>
  );
}
