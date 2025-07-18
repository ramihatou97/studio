import type { AppState } from '@/lib/types';
import { MediShiftLogo } from './icons';
import { RoleSwitcher } from './role-switcher';

interface AppHeaderProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function AppHeader({ appState, setAppState }: AppHeaderProps) {
  return (
    <header className="container mx-auto p-4 md:p-8">
      <div className="flex justify-center items-center gap-4 relative">
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
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <RoleSwitcher appState={appState} setAppState={setAppState} />
      </div>
    </header>
  );
}
