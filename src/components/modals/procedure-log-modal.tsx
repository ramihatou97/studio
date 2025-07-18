import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { AppState, OrCase, Resident } from '@/lib/types';
import { BookUser, Download } from 'lucide-react';

interface ProcedureLogModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

export function ProcedureLogModal({ isOpen, onOpenChange, appState }: ProcedureLogModalProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const { currentUser, residents } = appState;

  // If current user is a resident, pre-select them and disable the dropdown.
  useEffect(() => {
    if (currentUser.role === 'resident') {
      setSelectedResidentId(currentUser.id);
    }
  }, [currentUser]);

  const neuroResidents = useMemo(() => residents.filter(r => r.type === 'neuro'), [residents]);

  const procedureLogData = useMemo(() => {
    if (!selectedResidentId) return [];

    const resident = residents.find(r => r.id === selectedResidentId);
    if (!resident) return [];

    const log: (OrCase & { date: string })[] = [];
    resident.schedule.forEach((activities, dayIndex) => {
        if (activities.includes('OR')) {
            const casesForDay = appState.orCases[dayIndex] || [];
            const dayDate = new Date(appState.general.startDate);
            dayDate.setDate(dayDate.getDate() + dayIndex);

            casesForDay.forEach(caseItem => {
                log.push({
                    ...caseItem,
                    date: dayDate.toISOString().split('T')[0],
                });
            });
        }
    });

    return log;
  }, [selectedResidentId, appState]);

  const handleExportCSV = () => {
    if (!procedureLogData.length || !selectedResidentId) return;
    
    const residentName = residents.find(r => r.id === selectedResidentId)?.name || 'resident';

    const headers = [
        "Date", "Patient Age", "Patient Sex", "Patient MRN", "Attending", 
        "Procedure", "Procedure Code", "Resident Role", "Comfort Level (/5)", "Comments"
    ];
    
    const csvContent = [
        headers.join(','),
        ...procedureLogData.map(item => [
            item.date,
            item.age,
            item.patientSex,
            `"${item.patientMrn}"`, // Enclose in quotes to handle potential commas
            `"${item.surgeon}"`,
            `"${item.procedure}"`,
            `"${item.procedureCode}"`,
            item.residentRole || '', // Placeholder
            item.comfortLevel || '', // Placeholder
            `"${item.comments || ''}"` // Placeholder
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${residentName.replace(/\s/g, '_')}_procedure_log.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  
  const isDropdownDisabled = currentUser.role === 'resident';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resident Procedure Log</DialogTitle>
          <DialogDescription>
            {isDropdownDisabled
              ? "View your assigned OR cases from this schedule and export them to a CSV file for personal logging."
              : "Select a resident to view their assigned OR cases from this schedule and export them to a CSV file."
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <Select value={selectedResidentId} onValueChange={setSelectedResidentId} disabled={isDropdownDisabled}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select a resident..." /></SelectTrigger>
            <SelectContent>
              {neuroResidents.map(r => (
                <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportCSV} disabled={!selectedResidentId || procedureLogData.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export to CSV
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 p-1 border rounded-lg">
          {selectedResidentId ? (
            procedureLogData.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Attending</TableHead>
                            <TableHead>Procedure</TableHead>
                            <TableHead>Patient</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {procedureLogData.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{item.date}</TableCell>
                                <TableCell>{item.surgeon}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{item.procedure}</div>
                                    <div className="text-xs text-muted-foreground">{item.procedureCode}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{item.patientMrn}</div>
                                    <div className="text-xs text-muted-foreground">{item.age}yo {item.patientSex}</div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                    <BookUser className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-semibold">No Procedures Found</h3>
                    <p>This resident has not been assigned to any OR cases in the current schedule.</p>
                </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                <BookUser className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Select a Resident</h3>
                <p>Choose a resident from the dropdown above to view their procedure log.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
