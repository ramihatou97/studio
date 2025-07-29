
import type { AppState } from '@/lib/types';
import { Brain, Bone, UserCheck, Sun, Moon, Shield, Stethoscope, BookOpen, Users, GraduationCap, Briefcase, Minus } from 'lucide-react';
import { calculateNumberOfDays } from '@/lib/utils';

interface OnCallScheduleProps {
  appState: AppState;
}

export function OnCallSchedule({ appState }: OnCallScheduleProps) {
  const { general, residents, staffCall, caseRounds, articleDiscussions, mmRounds } = appState;
  const { startDate, endDate } = general;
  if (!startDate || !endDate) return null;

  const start = new Date(startDate);
  const numberOfDays = calculateNumberOfDays(startDate, endDate);
  const startDayOfWeek = start.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const dailyRoster = [...Array(numberOfDays)].map((_, dayIndex) => {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayIndex);
    
    const dayCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Day Call'));
    const nightCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Night Call'));
    const weekendCallResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Weekend Call'));
    const backupResidents = residents.filter(r => r.schedule[dayIndex]?.includes('Backup'));

    const caseRoundPresenter = caseRounds.find(cr => cr.dayIndex === dayIndex);
    const articleDiscussion = articleDiscussions.find(ad => ad.dayIndex === dayIndex);
    const mmRound = mmRounds.find(mm => mm.dayIndex === dayIndex);

    const cranialCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'cranial')?.staffName;
    const spineCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'spine')?.staffName;
    
    let academicActivity: string | null = null;
    switch (dayDate.getDay()) {
      case 1: academicActivity = 'INR Rounds'; break;
      case 2: academicActivity = 'Spine/Red'; break;
      case 3: academicActivity = 'Blue/SF'; break;
      case 4: academicActivity = 'Tumour Rounds'; break;
      case 5: academicActivity = 'Half-Day'; break;
    }

    return {
      date: dayDate,
      dayNumber: dayDate.getDate(),
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
      dayCallResidents,
      nightCallResidents,
      weekendCallResidents,
      backupResidents,
      cranialCallStaff,
      spineCallStaff,
      caseRoundPresenter,
      articleDiscussion,
      mmRound,
      academicActivity,
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
            <div className="flex-grow space-y-1 mt-2 text-xs">
                 {day.academicActivity && (
                     <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-400">
                        <GraduationCap className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate">{day.academicActivity}</span>
                    </div>
                 )}
                {day.caseRoundPresenter && (
                    <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Stethoscope className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={residents.find(r=>r.id === day.caseRoundPresenter?.residentId)?.name}>
                            Rounds: {residents.find(r=>r.id === day.caseRoundPresenter?.residentId)?.name}
                        </span>
                    </div>
                )}
                {day.articleDiscussion && (
                     <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <BookOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={staffCall.find(s=>s.staffName === day.articleDiscussion?.staffId)?.staffName}>
                           Journal Club
                        </span>
                    </div>
                )}
                 {day.mmRound && (
                     <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium">M&M Rounds</span>
                    </div>
                )}
                
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
