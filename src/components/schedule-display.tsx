import type { AppState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSummaryTable } from './schedule-summary-table';
import { EditableScheduleCell } from './editable-schedule-cell';

interface ScheduleDisplayProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ScheduleDisplay({ appState, setAppState }: ScheduleDisplayProps) {
  const { residents, medicalStudents, otherLearners, errors } = appState;
  const numberOfDays = residents[0]?.schedule.length || 0;

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
                      {r.schedule.map((activities, dayIndex) => (
                        <TableCell key={`${r.id}-${dayIndex}`} className="text-center p-1">
                          <EditableScheduleCell
                            resident={r}
                            dayIndex={dayIndex}
                            setAppState={setAppState}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </TabsContent>

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
