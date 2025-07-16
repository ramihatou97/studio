import type { AppState, OrCase, ClinicAssignment } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Trash2, Sparkles, Wand2, BriefcaseMedical } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { prepopulateOrCasesAction } from "@/lib/actions";


function AiOrCasePrepopulation({ appState, setAppState }: { appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const allStaff = appState.staff;

  const handleParse = async () => {
    if (!text.trim()) {
      toast({ variant: 'destructive', title: 'No text provided', description: 'Please paste the schedule text to parse.' });
      return;
    }
    if (allStaff.length === 0) {
        toast({ variant: 'destructive', title: 'No Staff', description: 'Please add staff members before parsing.' });
        return;
    }

    setIsLoading(true);
    const staffList = allStaff.map(s => s.name);
    const result = await prepopulateOrCasesAction(text, staffList);

    if (result.success && result.data) {
      const newOrCases = { ...appState.orCases };
      result.data.forEach(caseItem => {
        // The flow returns 1-indexed day, but our app state is 0-indexed.
        const dayIndex = caseItem.day - 1;
        if (dayIndex >= 0) {
            if (!newOrCases[dayIndex]) {
                newOrCases[dayIndex] = [];
            }
            newOrCases[dayIndex].push({
                surgeon: caseItem.surgeon,
                diagnosis: caseItem.diagnosis,
                procedure: caseItem.procedure,
            });
        }
      });
      
      setAppState(prev => ({ ...prev, orCases: newOrCases }));
      toast({ title: 'Success', description: `Populated ${result.data.length} OR cases.` });
      setText('');
    } else {
      toast({ variant: 'destructive', title: 'Parsing Failed', description: result.error });
    }
    setIsLoading(false);
  };
  
  return (
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 my-6">
        <h4 className="text-md font-medium mb-2 text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Pre-population for OR Cases
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
            Paste the text of an existing OR schedule to have the AI extract and populate the assignments.
            Include day numbers, surgeon names, and case details.
        </p>
        <Textarea
            rows={4}
            className="mt-1"
            placeholder="e.g., 'July 1: Dr. Smith - Craniotomy for tumor. Dr. Jones - ACDF C5-6...'"
            value={text}
            onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-4 flex justify-end">
            <Button onClick={handleParse} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                {isLoading ? 'Parsing...' : <><Wand2 className="mr-2 h-4 w-4" /> Parse & Populate</>}
            </Button>
        </div>
      </div>
  )
}

interface OrClinicConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function OrClinicConfig({ appState, setAppState }: OrClinicConfigProps) {
  const { general, orCases, staff, clinicAssignments } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  const [newCase, setNewCase] = useState<Omit<OrCase, 'surgeon'>>({ diagnosis: '', procedure: '' });
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>('');
  
  const [newClinic, setNewClinic] = useState<Partial<ClinicAssignment>>({});


  const { numberOfDays } = (() => {
    if (!startDate || !endDate) return { numberOfDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();
  
  if (numberOfDays === 0) {
    return (
        <AccordionItem value="or-clinic-config">
            <AccordionTrigger className="text-lg font-medium">OR & Clinic Configuration</AccordionTrigger>
            <AccordionContent>
                <p className="text-muted-foreground italic text-center">Please set a valid date range to configure OR and Clinic assignments.</p>
            </AccordionContent>
        </AccordionItem>
    );
  }

  const allStaff = staff;

  const handleAddCase = () => {
    if (currentEditingDay === null || !selectedSurgeon || !newCase.procedure) return;
    const fullCase: OrCase = { surgeon: selectedSurgeon, ...newCase };
    const newOrCases = { ...orCases };
    const dayIndex = currentEditingDay;
    if (!newOrCases[dayIndex]) {
      newOrCases[dayIndex] = [];
    }
    newOrCases[dayIndex].push(fullCase);
    setAppState(prev => ({ ...prev, orCases: newOrCases }));
    setNewCase({ diagnosis: '', procedure: '' });
    setSelectedSurgeon('');
  };
  
  const handleRemoveCase = (dayIndex: number, caseIndex: number) => {
    const newOrCases = { ...orCases };
    newOrCases[dayIndex].splice(caseIndex, 1);
    setAppState(prev => ({ ...prev, orCases: newOrCases }));
  };
  
  const handleAddClinic = () => {
    if (currentEditingDay === null || !newClinic.staffName || !newClinic.clinicType) return;
    const fullClinic: ClinicAssignment = {
        day: currentEditingDay + 1, // Store as 1-indexed
        staffName: newClinic.staffName,
        clinicType: newClinic.clinicType
    };
    setAppState(prev => ({...prev, clinicAssignments: [...prev.clinicAssignments, fullClinic]}));
    setNewClinic({});
  };

  const handleRemoveClinic = (day: number, staffName: string, clinicType: string) => {
    setAppState(prev => ({...prev, clinicAssignments: prev.clinicAssignments.filter(c => !(c.day === day && c.staffName === staffName && c.clinicType === clinicType))}))
  };

  const OrDayButton = ({ i }: { i: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    const caseCount = orCases[i]?.length || 0;
    
    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative" onClick={() => setCurrentEditingDay(i)}>
            <span className="font-bold text-lg">{dayOfMonth}</span>
            <span className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            {caseCount > 0 && <div className="absolute top-1 right-1 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">{caseCount}</div>}
          </Button>
        </DialogTrigger>
    );
  };
  
  const ClinicDayButton = ({ i }: { i: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    const clinicCount = clinicAssignments.filter(c => c.day === (i + 1)).length;
    
    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative" onClick={() => setCurrentEditingDay(i)}>
            <span className="font-bold text-lg">{dayOfMonth}</span>
            <span className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            {clinicCount > 0 && <div className="absolute top-1 right-1 text-xs bg-accent text-accent-foreground rounded-full h-5 w-5 flex items-center justify-center">{clinicCount}</div>}
          </Button>
        </DialogTrigger>
    );
  };


  return (
    <AccordionItem value="or-clinic-config">
      <AccordionTrigger className="text-lg font-medium">OR & Clinic Configuration</AccordionTrigger>
      <AccordionContent>
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-3">Daily Clinic Assignments</h3>
            <Dialog>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {[...Array(numberOfDays)].map((_, i) => <ClinicDayButton key={i} i={i} />)}
                </div>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage Clinics for Day {currentEditingDay !== null ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + currentEditingDay)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-[40vh] overflow-y-auto p-1">
                      {currentEditingDay !== null && clinicAssignments.filter(c => c.day === currentEditingDay + 1).map((c, i) => (
                          <div key={i} className="p-2 bg-muted rounded-md flex justify-between items-center">
                              <div>
                                  <p className="font-semibold">{c.staffName}</p>
                                  <p className="text-sm text-muted-foreground capitalize">{c.clinicType} Clinic</p>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveClinic(c.day, c.staffName, c.clinicType)}><Trash2 className="h-4 w-4"/></Button>
                          </div>
                      ))}
                      {currentEditingDay !== null && clinicAssignments.filter(c => c.day === currentEditingDay + 1).length === 0 && (
                          <p className="text-muted-foreground italic">No clinics scheduled for this day.</p>
                      )}
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                        <h3 className="font-semibold">Add New Clinic</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label>Staff Member</Label>
                                <Select value={newClinic.staffName} onValueChange={(val) => setNewClinic(c => ({...c, staffName: val}))}>
                                    <SelectTrigger><SelectValue placeholder="Select staff..."/></SelectTrigger>
                                    <SelectContent>
                                        {allStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Clinic Type</Label>
                                <Select value={newClinic.clinicType} onValueChange={(val: 'cranial' | 'spine' | 'general') => setNewClinic(c => ({...c, clinicType: val}))}>
                                    <SelectTrigger><SelectValue placeholder="Select type..."/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cranial">Cranial</SelectItem>
                                        <SelectItem value="spine">Spine</SelectItem>
                                        <SelectItem value="general">General</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleAddClinic} className="w-full mt-2">Add Clinic</Button>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
      
        <AiOrCasePrepopulation appState={appState} setAppState={setAppState} />
        
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-3">Daily OR Case Schedule</h3>
            <Dialog>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[...Array(numberOfDays)].map((_, i) => <OrDayButton key={i} i={i} />)}
            </div>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                <DialogTitle>Manage OR Cases for Day {currentEditingDay !== null ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + currentEditingDay)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
                {currentEditingDay !== null && (orCases[currentEditingDay] || []).map((c, i) => (
                    <div key={i} className="p-2 bg-muted rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{c.procedure}</p>
                        <p className="text-sm text-muted-foreground">{c.surgeon} | {c.diagnosis}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCase(currentEditingDay, i)}><Trash2 className="h-4 w-4"/></Button>
                    </div>
                ))}
                {currentEditingDay !== null && (!orCases[currentEditingDay] || orCases[currentEditingDay].length === 0) && (
                    <p className="text-muted-foreground italic">No cases scheduled for this day.</p>
                )}
                </div>
                <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h3 className="font-semibold">Add New Case</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Staff Surgeon</Label>
                        <Select value={selectedSurgeon} onValueChange={setSelectedSurgeon}>
                            <SelectTrigger><SelectValue placeholder="Select surgeon..."/></SelectTrigger>
                            <SelectContent>
                            {allStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Diagnosis</Label>
                        <Input value={newCase.diagnosis} onChange={e => setNewCase(c => ({...c, diagnosis: e.target.value}))}/>
                    </div>
                    <div className="md:col-span-2">
                        <Label>Approach / Procedure</Label>
                        <Input value={newCase.procedure} onChange={e => setNewCase(c => ({...c, procedure: e.target.value}))} />
                    </div>
                </div>
                <Button onClick={handleAddCase} className="w-full mt-2">Add Case</Button>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
