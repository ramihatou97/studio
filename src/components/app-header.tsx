
import { MediShiftLogo } from './icons';

export function AppHeader() {
  return (
    <header className="container mx-auto px-4 py-6 md:px-8 md:py-8">
      <div className="flex justify-center items-center gap-4 relative">
        <MediShiftLogo className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
            MediShift
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            AI Neurosurgery Resident Scheduler
          </p>
        </div>
      </div>
    </header>
  );
}
