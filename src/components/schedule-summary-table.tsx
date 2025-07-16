import type { AppState, Resident } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ScheduleSummaryTableProps {
  appState: AppState;
}

interface ActivityCounts {
  'Day Call': number;
  'Night Call': number;
  'Weekend Call': number;
  'Post-Call': number;
  'Vacation': number;
  'Clinic': number;
  'OR': number;
  'Float': number;
  'Pager Holder': number;
  'Backup': number;
}

export function ScheduleSummaryTable({ appState }: ScheduleSummaryTableProps) {
  const { residents } = appState;

  const calculateCounts = (resident: Resident): ActivityCounts => {
    const counts: ActivityCounts = {
      'Day Call': 0,
      'Night Call': 0,
      'Weekend Call': 0,
      'Post-Call': 0,
      'Vacation': 0,
      'Clinic': 0,
      'OR': 0,
      'Float': 0,
      'Pager Holder': 0,
      'Backup': 0,
    };
    
    if (!resident.schedule) return counts;

    resident.schedule.forEach(dayActivities => {
      dayActivities.forEach(activity => {
        if (typeof activity === 'string' && activity in counts) {
          counts[activity as keyof ActivityCounts]++;
        }
      });
    });

    return counts;
  };
  
  const headers: (keyof ActivityCounts)[] = ['Day Call', 'Night Call', 'Weekend Call', 'Post-Call', 'Vacation', 'Clinic', 'OR', 'Float', 'Pager Holder', 'Backup'];

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Monthly Summary</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card z-10 w-[200px] font-bold">Resident</TableHead>
              {headers.map(header => (
                <TableHead key={header} className="text-center">{header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {residents.map(resident => {
              const counts = calculateCounts(resident);
              return (
                <TableRow key={resident.id}>
                  <TableCell className="sticky left-0 bg-card z-10 font-medium">{resident.name}</TableCell>
                  {headers.map(header => (
                    <TableCell key={header} className="text-center">{counts[header]}</TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
