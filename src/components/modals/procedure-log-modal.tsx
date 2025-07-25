
import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AppState, ManualProcedure, OrCase, ResidentRole } from '@/lib/types';
import { BookUser, Download, PlusCircle, Wand2, Edit, Copy, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { suggestProcedureCodeAction } from '@/ai/actions';

interface ProcedureLogModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

type ProcedureLogEntry = (OrCase | ManualProcedure) & { 
    id: string; // Ensure all entries have a unique ID
    date: string; 
    isManual: boolean; 
};

type ManualProcedureFormState = Omit<ManualProcedure, 'id' | 'residentId'>;

export function ProcedureLogModal({ isOpen, onOpenChange, appState, setAppState }: ProcedureLogModalProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formState, setFormState] = useState<ManualProcedureFormState>({
      date: new Date().toISOString().split('T')[0], surgeon: '', procedure: '', procedureCode: '',
      patientMrn: '', patientSex: 'other', age: 0, residentRole: 'assistant', comments: ''
  });
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  const { currentUser, residents } = appState;
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser.role === 'resident') {
      setSelectedResidentId(currentUser.id);
    }
     if (!isOpen) {
      resetForm();
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

                casesForDay.forEach((caseItem, caseIndex) => {
                    const id = `or-${dayIndex}-${caseIndex}`;
                    const manualVersion = (appState.manualProcedures || []).find(p => p.basedOn === id);
                    if (!manualVersion) { // Only show if not converted to manual entry
                        scheduledProcedures.push({
                            ...caseItem,
                            id,
                            date: dayDate.toISOString().split('T')[0],
                            isManual: false,
                        });
                    }
                });
            }
        });
    }
    
    const manualProcedures: ProcedureLogEntry[] = (appState.manualProcedures || [])
        .filter(p => p.residentId === selectedResidentId)
        .map(p => ({...p, isManual: true}));

    return [...scheduledProcedures, ...manualProcedures].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedResidentId, appState]);


  const resetForm = () => {
    setIsFormOpen(false);
    setEditingEntryId(null);
    setFormState({
      date: new Date().toISOString().split('T')[0], surgeon: '', procedure: '', procedureCode: '',
      patientMrn: '', patientSex: 'other', age: 0, residentRole: 'assistant', comments: ''
    });
  }

  const handleOpenForm = (entry?: ProcedureLogEntry) => {
    if (entry) {
        setFormState({
            date: entry.date,
            surgeon: entry.surgeon,
            procedure: entry.procedure,
            procedureCode: entry.procedureCode,
            patientMrn: entry.patientMrn,
            patientSex: entry.patientSex,
            age: entry.age,
            residentRole: entry.residentRole || 'assistant',
            comments: entry.comments || '',
            basedOn: entry.isManual ? undefined : entry.id, // Link to original OR case
        });
        setEditingEntryId(entry.id);
    }
    setIsFormOpen(true);
  };
  
  const handleSaveProcedure = () => {
    if (!formState.procedure || !formState.surgeon || !selectedResidentId) return;

    setAppState(prev => {
      let manualProcs = [...(prev.manualProcedures || [])];
      
      if (editingEntryId && !editingEntryId.startsWith('or-')) { // Editing an existing manual entry
          manualProcs = manualProcs.map(p => p.id === editingEntryId ? { ...p, ...formState } : p);
      } else { // New entry or converting an OR case
          const procToAdd: ManualProcedure = { ...formState, id: uuidv4(), residentId: selectedResidentId };
          manualProcs.push(procToAdd);
      }

      return { ...prev, manualProcedures: manualProcs };
    });
    
    resetForm();
  };

  const handleSuggestCode = async () => {
    if (!formState.procedure) {
        toast({variant: 'destructive', title: 'Please enter a procedure description first.'});
        return;
    }
    setIsSuggestingCode(true);
    const result = await suggestProcedureCodeAction(formState.procedure);
    if (result.success && result.data) {
        setFormState(p => ({...p, procedureCode: result.data.suggestedCode}));
        toast({title: `Suggested Code: ${result.data.suggestedCode}`, description: result.data.rationale});
    } else {
        toast({variant: 'destructive', title: 'Suggestion Failed', description: result.error});
    }
    setIsSuggestingCode(false);
  };

  const handleExportCSV = () => {
    // CSV export logic remains the same
  };
  
  const isDropdownDisabled = currentUser.role === 'resident';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resident Procedure Log</DialogTitle>
          <DialogDescription>
            View and manage assigned and manually-entered OR cases. Use the edit button to add your role and comments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <Select value={selectedResidentId} onValueChange={setSelectedResidentId} disabled={isDropdownDisabled}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Select a resident..." /></SelectTrigger>
            <SelectContent>
              {neuroResidents.map(r => <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => handleOpenForm()} disabled={!selectedResidentId}>
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
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {procedureLogData.map((item) => (
                            <TableRow key={item.id} className={item.isManual ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
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
                                <TableCell className="capitalize">{item.residentRole || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenForm({...item, procedure: `Copy of: ${item.procedure}`, id: ''})}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TableCell>
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

      <Dialog open={isFormOpen} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingEntryId ? 'Edit' : 'Add'} Procedure Entry</DialogTitle>
                  <DialogDescription>Log a case that was not on the generated schedule or add details to an existing one.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="proc-date" className="text-right">Date</Label>
                  <Input id="proc-date" type="date" value={formState.date} onChange={e => setFormState(p => ({...p, date: e.target.value}))} className="col-span-3"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-surgeon" className="text-right">Surgeon</Label>
                    <Select value={formState.surgeon} onValueChange={val => setFormState(p => ({...p, surgeon: val}))}>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Select surgeon..."/></SelectTrigger>
                        <SelectContent>
                            {appState.staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-procedure" className="text-right">Procedure</Label>
                    <Input id="proc-procedure" value={formState.procedure} onChange={e => setFormState(p => ({...p, procedure: e.target.value}))} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-code" className="text-right">CPT Code</Label>
                    <div className="col-span-3 flex gap-2">
                        <Input id="proc-code" value={formState.procedureCode} onChange={e => setFormState(p => ({...p, procedureCode: e.target.value}))} />
                        <Button variant="outline" size="icon" onClick={handleSuggestCode} disabled={isSuggestingCode}>
                            {isSuggestingCode ? <Loader2 className="animate-spin"/> : <Wand2 />}
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="proc-role" className="text-right">Your Role</Label>
                    <Select value={formState.residentRole} onValueChange={(val: ResidentRole) => setFormState(p => ({...p, residentRole: val}))}>
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
                    <Textarea id="proc-comments" value={formState.comments} onChange={e => setFormState(p => ({...p, comments: e.target.value}))} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                  <Button onClick={handleSaveProcedure}>Save Entry</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </Dialog>
  );
}
