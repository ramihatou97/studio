
import type { AppState } from '@/lib/types';
import { Brain, Bone, UserCheck, Sun, Moon, Shield } from 'lucide-react';

interface OnCallScheduleProps {
  appState: AppState;
}

export function OnCallSchedule({ appState }: OnCallScheduleProps) {
  const { general, residents, staffCall } = appState;
  const { startDate, endDate } = general;
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const numberOfDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const startDayOfWeek = start.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const dailyRoster = [...Array(numberOfDays)].map((_, dayIndex) => {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    const dayCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Day Call'));
    const nightCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Night Call'));
    const weekendCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Weekend Call'));
    
    const backupResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Backup'));

    const cranialCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'cranial')?.staffName;
    const spineCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'spine')?.staffName;

    return {
      date: dayDate,
      dayNumber: dayDate.getDate(),
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
      dayCallResidents,
      nightCallResidents,
      weekendCallResidents,
      backupResidents,
      cranialCallStaff,
      spineCallStaff
    };
  });
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 gap-px border-l border-t bg-border rounded-lg overflow-hidden">
        {weekdays.map(day => (
          <div key={day} className="text-center font-bold py-2 bg-muted text-muted-foreground text-sm">{day}</div>
        ))}
        
        {/* Empty cells for the start of the month */}
        {[...Array(startDayOfWeek)].map((_, i) => <div key={`empty-${i}`} className="bg-muted/50"></div>)}

        {dailyRoster.map((day, index) => (
          <div key={index} className={`p-2 min-h-[160px] flex flex-col ${day.isWeekend ? 'bg-card' : 'bg-card/70'} relative`}>
            <div className="font-bold text-lg">{day.dayNumber}</div>
            <div className="flex-grow space-y-2 mt-2 text-xs">
                {/* Staff Call */}
                {day.cranialCallStaff && (
                    <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                        <Brain className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={day.cranialCallStaff}>{day.cranialCallStaff}</span>
                    </div>
                )}
                 {day.spineCallStaff && (
                    <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <Bone className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={day.spineCallStaff}>{day.spineCallStaff}</span>
                    </div>
                )}
                
                {/* Resident Call */}
                 {day.weekendCallResidents.map(r => (
                    <div key={r.id} className="flex items-center gap-1.5 text-destructive font-semibold">
                        <Shield className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={r.name}>{r.name} (PGY-{r.level})</span>
                    </div>
                ))}
                {day.dayCallResidents.map(r => (
                    <div key={r.id} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-500">
                        <Sun className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={r.name}>{r.name} (PGY-{r.level})</span>
                    </div>
                ))}
                 {day.nightCallResidents.map(r => (
                    <div key={r.id} className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400">
                        <Moon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={r.name}>{r.name} (PGY-{r.level})</span>
                    </div>
                ))}

                {/* Backup */}
                {day.backupResidents.map(r => (
                     <div key={r.id} className="flex items-center gap-1.5 text-green-700 dark:text-green-500">
                        <UserCheck className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate" title={r.name}>B: {r.name} (PGY-{r.level})</span>
                    </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
