
import type { AppState, ScheduleError } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableScheduleCell } from './editable-schedule-cell';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear } from 'date-fns';

interface WeeklyScheduleViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

// Validation function to check for rule violations
function validateSchedule(appState: AppState): ScheduleError[] {
  const { residents, general, onServiceCallRules } = appState;
  const { startDate, endDate } = general;
  const errors: ScheduleError[] = [];
  
  if (!startDate || !endDate) return [{ type: 'NO_ELIGIBLE_RESIDENT', message: "Start and End dates must be set." }];
  const numberOfDays = Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Recalculate call stats from the schedule
  const validatedResidents = residents.map(r => {
      const callDays: number[] = [];
      let weekendCalls = 0;
      r.schedule.forEach((activities, dayIndex) => {
          if (activities.some(act => ['Day Call', 'Night Call', 'Weekend Call'].includes(act as string))) {
              callDays.push(dayIndex);
              const currentDate = new Date(startDate);
              currentDate.setDate(currentDate.getDate() + dayIndex);
              const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
              if (isWeekend) weekendCalls++;
          }
      });
      return {...r, callDays, weekendCalls};
  });
  
  validatedResidents.forEach(res => {
    // Rule: Max calls
    const maxCalls = res.onService ? (onServiceCallRules.find(rule => (numberOfDays - res.vacationDays.length) >= rule.minDays && (numberOfDays - res.vacationDays.length) <= rule.maxDays)?.calls ?? 0) : res.offServiceMaxCall;
    if (res.callDays.length > maxCalls && maxCalls > 0) {
        errors.push({
            type: 'MAX_CALLS',
            message: `${res.name} exceeds max calls (${res.callDays.length}/${maxCalls}).`,
            residentId: res.id,
        });
    }

    // Rule: Post-call violations
    for (let dayIndex = 0; dayIndex < numberOfDays - 1; dayIndex++) {
        const hasNightOrWeekendCall = res.schedule[dayIndex].some(act => ['Night Call', 'Weekend Call'].includes(act as string));
        if (hasNightOrWeekendCall && !res.schedule[dayIndex + 1].includes('Post-Call') && !res.schedule[dayIndex + 1].includes('Vacation')) {
            errors.push({
                type: 'POST_CALL_VIOLATION',
                message: `${res.name} has a post-call violation on day ${dayIndex + 2}.`,
                residentId: res.id,
                dayIndex: dayIndex + 1
            });
        }
    }
    
    // Rule: PGY-1 solo call
    if (res.type === 'neuro' && res.level === 1 && !res.allowSoloPgy1Call) {
        res.callDays.forEach(dayIndex => {
            const backupPresent = validatedResidents.some(r => r.schedule[dayIndex].includes('Backup'));
            if (!backupPresent) {
                errors.push({
                    type: 'NO_BACKUP',
                    message: `PGY-1 ${res.name} is on call without backup on day ${dayIndex + 1}.`,
                    residentId: res.id,
                    dayIndex: dayIndex
                });
            }
        });
    }
  });

  return errors;
}


function WeekTable({ weekNumber, appState, setAppState, weekStartDate, daysInWeek }: { weekNumber: number, appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState | null>>, weekStartDate: Date, daysInWeek: number }) {
  const { residents, errors } = appState;

  return (
    <div key={weekNumber} className="mb-8">
      <h3 className="text-xl font-semibold mb-3">Week {weekNumber}</h3>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10 w-[200px] min-w-[200px] font-bold">Resident</TableHead>
              {[...Array(daysInWeek)].map((_, i) => {
                const dayDate = new Date(weekStartDate);
                dayDate.setDate(dayDate.getDate() + i);
                return (
                  <TableHead key={i} className="text-center min-w-[120px]">
                    <div>{dayDate.getDate()}</div>
                    <div className="text-xs font-normal">{dayDate.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map((r) => {
              const startDayIndex = (weekNumber - 1) * 7;
              return(
                <TableRow key={r.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">{r.name}</TableCell>
                  {[...Array(daysInWeek)].map((_, i) => {
                    const dayIndex = startDayIndex + i;
                    const hasError = !!errors?.some(e => e.residentId === r.id && e.dayIndex === dayIndex);
                    return (
                      <TableCell key={`${r.id}-${dayIndex}`} className="text-center p-1">
                        <EditableScheduleCell
                          resident={r}
                          dayIndex={dayIndex}
                          setAppState={setAppState}
                          hasError={hasError}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function WeeklyScheduleView({ appState, setAppState }: WeeklyScheduleViewProps) {
  const { residents, general } = appState;
  const { startDate, endDate } = general;
  const { toast } = useToast();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData || !overData) return;
      if (activeData.dayIndex !== overData.dayIndex) return; // Only allow swaps on the same day

      let newAppState: AppState | null = null;
      
      setAppState(prev => {
        if (!prev) return null;

        const sourceResidentIndex = prev.residents.findIndex(r => r.id === activeData.residentId);
        const targetResidentIndex = prev.residents.findIndex(r => r.id === overData.residentId);

        if (sourceResidentIndex === -1 || targetResidentIndex === -1) return prev;

        const newResidents = [...prev.residents];
        const dayIndex = activeData.dayIndex;
        
        const sourceSchedule = newResidents[sourceResidentIndex].schedule[dayIndex];
        const targetSchedule = newResidents[targetResidentIndex].schedule[dayIndex];

        // Perform the swap
        newResidents[sourceResidentIndex] = {
            ...newResidents[sourceResidentIndex],
            schedule: newResidents[sourceResidentIndex].schedule.map((s, i) => i === dayIndex ? targetSchedule : s),
        };
        newResidents[targetResidentIndex] = {
            ...newResidents[targetResidentIndex],
            schedule: newResidents[targetResidentIndex].schedule.map((s, i) => i === dayIndex ? sourceSchedule : s),
        };
        
        newAppState = { ...prev, residents: newResidents };
        
        // Post-swap validation
        if (newAppState) {
            const validationErrors = validateSchedule(newAppState);
            newAppState = {...newAppState, errors: validationErrors};

            if (validationErrors.length > 0) {
                toast({
                  variant: "destructive",
                  title: "Manual Swap Created Conflicts",
                  description: (
                    <ul className="list-disc list-inside">
                      {validationErrors.map((error, i) => <li key={i}>{error.message}</li>)}
                    </ul>
                  ),
                });
              } else {
                 toast({
                  title: "Swap Successful",
                  description: "The schedule has been updated without new conflicts.",
                });
              }
        }

        return newAppState;
      });
    }
  };
  
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  return (
    <DndContext onDragEnd={handleDragEnd}>
       {[...Array(totalWeeks)].map((_, i) => {
         const weekStartDate = new Date(start);
         weekStartDate.setDate(weekStartDate.getDate() + i * 7);
         
         const remainingDays = totalDays - i * 7;
         const daysInWeek = Math.min(7, remainingDays);

         return (
            <WeekTable 
                key={i} 
                weekNumber={i + 1} 
                appState={appState} 
                setAppState={setAppState} 
                weekStartDate={weekStartDate}
                daysInWeek={daysInWeek}
            />
         )
       })}
    </DndContext>
  );
}
