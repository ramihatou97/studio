
import type { AppState } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScheduleSummaryTable } from './schedule-summary-table';
import { OnCallSchedule } from './on-call-schedule';
import { WeeklyScheduleView } from './weekly-schedule-view';

interface ScheduleDisplayProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ScheduleDisplay({ appState, setAppState }: ScheduleDisplayProps) {
  return (
    <Card className="mt-8 shadow-lg">
      <CardHeader>
        <CardTitle>Generated Schedules</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly-view" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weekly-view">Weekly Activities</TabsTrigger>
            <TabsTrigger value="on-call">On-Call Roster</TabsTrigger>
            <TabsTrigger value="summary">Monthly Summary</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly-view">
             <WeeklyScheduleView appState={appState} setAppState={setAppState} />
          </TabsContent>

          <TabsContent value="on-call">
            <OnCallSchedule appState={appState} />
          </TabsContent>
          
          <TabsContent value="summary">
             <ScheduleSummaryTable appState={appState} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
