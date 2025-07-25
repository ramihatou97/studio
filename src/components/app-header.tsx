
import type { UserProfile } from '@/lib/types';
import { MediShiftLogo } from './icons';
import { RoleSwitcher } from './role-switcher';

interface AppHeaderProps {
  allUsers: UserProfile[];
  currentUser: UserProfile;
  setSwitchedUser: (user: UserProfile) => void;
}

export function AppHeader({ allUsers, currentUser, setSwitchedUser }: AppHeaderProps) {
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
      <div className="absolute top-4 right-4 md:top-6 md:right-6">
        <RoleSwitcher allUsers={allUsers} currentUser={currentUser} setSwitchedUser={setSwitchedUser} />
      </div>
    </header>
  );
}
