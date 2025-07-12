import { MediShiftLogo } from './icons';

export function AppHeader() {
  return (
    <header className="container mx-auto p-4 md:p-8 text-center">
      <div className="flex justify-center items-center gap-4">
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
    </header>
  );
}
