
import { MediShiftLogo } from '@/components/icons';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
       <div className="w-full max-w-md">
        <div className="flex justify-center items-center gap-4 mb-8">
            <MediShiftLogo className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                MediShift
              </h1>
              <p className="text-muted-foreground mt-1">
                AI Neurosurgery Resident Scheduler
              </p>
            </div>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-lg">
            {children}
        </div>
       </div>
    </div>
  );
}
