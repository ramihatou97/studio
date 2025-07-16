
import type { AppState, Resident } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSummaryTable } from './schedule-summary-table';
import { EditableScheduleCell } from './editable-schedule-cell';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';
import { validateSchedule } from '@/lib/schedule-generator';
import { useToast } from '@/hooks/use-toast';

interface ScheduleDisplayProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ScheduleDisplay({ appState, setAppState }: ScheduleDisplayProps) {
  const { residents, medicalStudents, otherLearners, errors } = appState;
  const numberOfDays = residents[0]?.schedule.length || 0;
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
        return newAppState;
      });

      // Post-update validation
      if (newAppState) {
          const validationErrors = validateSchedule(newAppState);
          setAppState(prev => ({...prev, errors: validationErrors}));
          
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
    }
  };


  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>Generated Schedules</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="residents">
          <TabsList>
            <TabsTrigger value="residents">Residents</TabsTrigger>
            <TabsTrigger value="students">Medical Students</TabsTrigger>
            <TabsTrigger value="others">Other Learners</TabsTrigger>
          </TabsList>
          
          <DndContext onDragEnd={handleDragEnd}>
            <TabsContent value="residents" className="overflow-x-auto">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sticky left-0 bg-card z-10 w-[150px]">Resident</TableHead>
                      {[...Array(numberOfDays)].map((_, i) => <TableHead key={i} className="text-center">{i + 1}</TableHead>)}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {residents.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="sticky left-0 bg-card z-10 font-medium">{r.name}</TableCell>
                        {r.schedule.map((_, dayIndex) => {
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
                    ))}
                  </TableBody>
                </Table>
            </TabsContent>
          </DndContext>

          <TabsContent value="students">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Preceptor</TableHead>
                    <TableHead>On-Call Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medicalStudents.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.level}</TableCell>
                      <TableCell>{s.preceptor}</TableCell>
                      <TableCell>{s.calls.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </TabsContent>

           <TabsContent value="others">
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Learner</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Schedule</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {otherLearners.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.name}</TableCell>
                      <TableCell>{l.role}</TableCell>
                      <TableCell className="whitespace-pre-wrap">{l.scheduleText}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </TabsContent>

        </Tabs>

        <ScheduleSummaryTable appState={appState} />
      </CardContent>
    </Card>
  );
}
