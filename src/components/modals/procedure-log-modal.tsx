
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppState, ManualProcedure, OrCase } from '@/lib/types';
import { BookUser, Download, PlusCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProcedureLogModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ProcedureLogEntry = (OrCase | ManualProcedure) & { date: string; isManual: boolean };

export function ProcedureLogModal({ isOpen, onOpenChange, appState, setAppState }: ProcedureLogModalProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProcedure, setNewProcedure] = useState<Omit<ManualProcedure, 'id' | 'residentId'>>({
      date: new Date().toISOString().split('T')[0],
      surgeon: '',
      procedure: '',
      procedureCode: '',
      patientMrn: '',
      patientSex: 'other',
      age: 0,
      residentRole: 'assistant',
      comments: ''
  });

  const { currentUser, residents } = appState;

  useEffect(() => {
    if (currentUser.role === 'resident') {
      setSelectedResidentId(currentUser.id);
    }
  }, [currentUser, isOpen]);

  const neuroResidents = useMemo(() => residents.filter(r => r.type === 'neuro'), [residents]);

  const procedureLogData: ProcedureLogEntry[] = useMemo(() => {
    if (!selectedResidentId) return [];

    const resident = residents.find(r => r.id === selectedResidentId);
    if (!resident) return [];

    const scheduledProcedures: ProcedureLogEntry[] = [];
    if (resident.schedule) {
        resident.schedule.forEach((activities, dayIndex) => {
            if (activities.includes('OR')) {
                const casesForDay = appState.orCases[dayIndex] || [];
                const dayDate = new Date(appState.general.startDate);
                dayDate.setDate(dayDate.getDate() + dayIndex);

                casesForDay.forEach(caseItem => {
                    scheduledProcedures.push({
                        ...caseItem,
                        date: dayDate.toISOString().split('T')[0],
                        isManual: false,
                    });
                });
            }
        });
    }
    
    const manualProcedures: ProcedureLogEntry[] = (appState.manualProcedures || [])
        .filter(p => p.residentId === selectedResidentId)
        .map(p => ({...p, isManual: true}));

    return [...scheduledProcedures, ...manualProcedures].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedResidentId, appState]);

  const handleAddProcedure = () => {
    if (!newProcedure.procedure || !newProcedure.surgeon || !selectedResidentId) return;

    const procToAdd: ManualProcedure = {
        ...newProcedure,
        id: uuidv4(),
        residentId: selectedResidentId,
    };

    setAppState(prev => ({
        ...prev,
        manualProcedures: [...(prev.manualProcedures || []), procToAdd],
    }));
    
    setShowAddForm(false);
    setNewProcedure({
      date: new Date().toISOString().split('T')[0],
      surgeon: '',
      procedure: '',
      procedureCode: '',
      patientMrn: '',
      patientSex: 'other',
      age: 0,
      residentRole: 'assistant',
      comments: ''
    });
  };

  const handleExportCSV = () => {
    if (!procedureLogData.length || !selectedResidentId) return;
    
    const residentName = residents.find(r => r.id === selectedResidentId)?.name || 'resident';

    const headers = [
        "Date", "Patient Age", "Patient Sex", "Patient MRN", "Attending", 
        "Procedure", "Procedure Code", "Resident Role", "Comments"
    ];
    
    const csvContent = [
        headers.join(','),
        ...procedureLogData.map(item => [
            item.date,
            item.age,
            item.patientSex,
            `"${item.patientMrn}"`,
            `"${item.surgeon}"`,
            `"${item.procedure}"`,
            `"${item.procedureCode}"`,
            item.residentRole || '',
            `"${item.comments || ''}"`
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
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resident Procedure Log</DialogTitle>
          <DialogDescription>
            {isDropdownDisabled
              ? "View and manage your assigned and manually-entered OR cases. Export to CSV for personal logging."
              : "Select a resident to view and manage their procedure log."
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
          <Button onClick={() => setShowAddForm(true)} disabled={!selectedResidentId}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Entry
          </Button>
          <Button onClick={handleExportCSV} disabled={!selectedResidentId || procedureLogData.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
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
                            <TableHead>Role</TableHead>
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
                                <TableCell className="capitalize">{item.residentRole}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                 <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                    <BookUser className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-semibold">No Procedures Logged</h3>
                    <p>Add a new entry or generate a schedule with OR cases to see them here.</p>
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

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Add Manual Procedure Entry</DialogTitle>
                  <DialogDescription>Log a case that was not on the generated schedule.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="proc-date" className="text-right">Date</Label>
                  <Input id="proc-date" type="date" value={newProcedure.date} onChange={e => setNewProcedure(p => ({...p, date: e.target.value}))} className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-surgeon" className="text-right">Surgeon</Label>
                    <Select value={newProcedure.surgeon} onValueChange={val => setNewProcedure(p => ({...p, surgeon: val}))}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select surgeon..."/></SelectTrigger>
                        <SelectContent>
                            {appState.staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-procedure" className="text-right">Procedure</Label>
                    <Input id="proc-procedure" value={newProcedure.procedure} onChange={e => setNewProcedure(p => ({...p, procedure: e.target.value}))} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-role" className="text-right">Your Role</Label>
                    <Select value={newProcedure.residentRole} onValueChange={val => setNewProcedure(p => ({...p, residentRole: val as any}))}>
                        <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                        <SelectContent>
                           <SelectItem value="un-scrubbed observer">Un-scrubbed Observer</SelectItem>
                           <SelectItem value="scrubbed observer">Scrubbed Observer</SelectItem>
                           <SelectItem value="assistant">Assistant</SelectItem>
                           <SelectItem value="senior">Senior</SelectItem>
                           <SelectItem value="lead">Lead</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-comments" className="text-right">Comments</Label>
                    <Textarea id="proc-comments" value={newProcedure.comments} onChange={e => setNewProcedure(p => ({...p, comments: e.target.value}))} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                  <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                  <Button onClick={handleAddProcedure}>Save Entry</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Dialog>
  );
}
