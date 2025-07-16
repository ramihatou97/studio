
import type { AppState } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Brain, Bone, UserCheck, Sun, Moon } from 'lucide-react';
import { Badge } from './ui/badge';

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

  const dailyRoster = [...Array(numberOfDays)].map((_, dayIndex) => {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + dayIndex);

    const onCallAssignments = residents
      .map(r => {
        const callActivities = r.schedule[dayIndex]?.filter(act => ['Day Call', 'Night Call', 'Weekend Call'].includes(act as string));
        return { resident: r, calls: callActivities };
      })
      .filter(assignment => assignment.calls && assignment.calls.length > 0);

    const backupResidents = residents.filter(r => 
        r.schedule[dayIndex]?.includes('Backup')
    );

    const cranialCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'cranial')?.staffName;
    const spineCallStaff = staffCall.find(c => c.day === (dayIndex + 1) && c.callType === 'spine')?.staffName;

    return {
      date: dayDate,
      onCallAssignments,
      backupResidents,
      cranialCallStaff,
      spineCallStaff
    };
  });
  
  const renderCallType = (calls: string[]) => {
    if (calls.includes('Weekend Call')) {
      return <Badge variant="destructive" className="ml-2">Weekend</Badge>;
    }
    if (calls.includes('Day Call') && calls.includes('Night Call')) {
        return <Badge variant="destructive" className="ml-2">24h Call</Badge>;
    }
    if (calls.includes('Day Call')) {
        return <span className="flex items-center text-sm ml-2 text-amber-600"><Sun className="w-4 h-4 mr-1"/> Day</span>;
    }
    if (calls.includes('Night Call')) {
        return <span className="flex items-center text-sm ml-2 text-indigo-600"><Moon className="w-4 h-4 mr-1"/> Night</span>;
    }
    return null;
  }

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px] font-bold">Date</TableHead>
              <TableHead className="font-bold">Staff Call</TableHead>
              <TableHead className="font-bold">Resident on Call</TableHead>
              <TableHead className="font-bold">Resident on Backup</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dailyRoster.map((day, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="font-medium">{day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  <div className="text-xs text-muted-foreground">{day.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    {day.cranialCallStaff && (
                      <Badge variant="outline" className="text-red-600 border-red-300 dark:text-red-400 dark:border-red-600 w-fit">
                        <Brain className="mr-2 h-4 w-4" /> {day.cranialCallStaff}
                      </Badge>
                    )}
                    {day.spineCallStaff && (
                      <Badge variant="outline" className="text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-600 w-fit">
                        <Bone className="mr-2 h-4 w-4" /> {day.spineCallStaff}
                      </Badge>
                    )}
                     {!day.cranialCallStaff && !day.spineCallStaff && <span className="text-muted-foreground italic text-xs">None</span>}
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-2">
                        {day.onCallAssignments.length > 0 ? day.onCallAssignments.map(assignment => (
                           <div key={assignment.resident.id} className="flex items-center">
                                <span>{assignment.resident.name} <span className="text-muted-foreground text-xs">(PGY-{assignment.resident.level})</span></span>
                                {renderCallType(assignment.calls)}
                           </div>
                        )) : <span className="text-muted-foreground italic text-xs">None</span>}
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col gap-1">
                       {day.backupResidents.length > 0 ? day.backupResidents.map(r => (
                           <div key={r.id} className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span>{r.name} <span className="text-muted-foreground text-xs">(PGY-{r.level})</span></span>
                           </div>
                        )) : <span className="text-muted-foreground italic text-xs">None</span>}
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
