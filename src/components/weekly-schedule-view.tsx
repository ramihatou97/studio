
import type { AppState, ScheduleError } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EditableScheduleCell } from './editable-schedule-cell';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { useToast } from '@/hooks/use-toast';
import { getMonth, getYear } from 'date-fns';
import { generateSchedules } from '@/lib/schedule-generator';
import { useState } from 'react';
import { EpaModal } from './modals/epa-modal';

interface WeeklyScheduleViewProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

function WeekTable({ weekNumber, appState, setAppState, weekStartDate, daysInWeek, onEpaClick }: { weekNumber: number, appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState | null>>, weekStartDate: Date, daysInWeek: number, onEpaClick: (residentId: string, dayIndex: number, activity: string) => void }) {
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
                          onEpaClick={onEpaClick}
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
  
  const [isEpaModalOpen, setEpaModalOpen] = useState(false);
  const [epaModalState, setEpaModalState] = useState<{residentId: string, dayIndex: number, activityDescription: string}>({residentId: '', dayIndex: 0, activityDescription: ''});


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

        const dayIndex = activeData.dayIndex;
        let tempResidents = [...prev.residents];
        
        const sourceSchedule = tempResidents[sourceResidentIndex].schedule[dayIndex];
        const targetSchedule = tempResidents[targetResidentIndex].schedule[dayIndex];

        // Perform the swap
        tempResidents[sourceResidentIndex] = {
            ...tempResidents[sourceResidentIndex],
            schedule: tempResidents[sourceResidentIndex].schedule.map((s, i) => i === dayIndex ? targetSchedule : s),
        };
        tempResidents[targetResidentIndex] = {
            ...tempResidents[targetResidentIndex],
            schedule: tempResidents[targetResidentIndex].schedule.map((s, i) => i === dayIndex ? sourceSchedule : s),
        };
        
        // Re-generate the schedule with the swapped residents to re-validate everything
        // This is not a full re-generation, but re-calculation of stats and errors
        const updatedStateWithSwaps = { ...prev, residents: tempResidents };
        const finalOutput = generateSchedules(updatedStateWithSwaps);
        newAppState = { ...prev, residents: finalOutput.residents, errors: finalOutput.errors };

        if (finalOutput.errors.length > (prev.errors?.length || 0)) {
            const newErrors = finalOutput.errors.filter(e => !(prev.errors || []).some(pe => pe.message === e.message));
            if (newErrors.length > 0) {
              toast({
                variant: "destructive",
                title: "Manual Swap Created Conflicts",
                description: (
                  <ul className="list-disc list-inside">
                    {newErrors.map((error, i) => <li key={i}>{error.message}</li>)}
                  </ul>
                ),
              });
            } else {
               toast({
                title: "Swap Successful",
                description: "The schedule has been updated.",
              });
            }
        } else {
            toast({
              title: "Swap Successful",
              description: "The schedule has been updated without new conflicts.",
            });
        }
        
        return newAppState;
      });
    }
  };
  
  const handleEpaClick = (residentId: string, dayIndex: number, activity: string) => {
    setEpaModalState({ residentId, dayIndex, activityDescription: activity });
    setEpaModalOpen(true);
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
                onEpaClick={handleEpaClick}
            />
         )
       })}

       <EpaModal 
        isOpen={isEpaModalOpen} 
        onOpenChange={setEpaModalOpen} 
        appState={appState} 
        setAppState={setAppState}
        preselectedResidentId={epaModalState.residentId}
        preselectedDayIndex={epaModalState.dayIndex}
        preselectedActivityDescription={epaModalState.activityDescription}
      />
    </DndContext>
  );
}
