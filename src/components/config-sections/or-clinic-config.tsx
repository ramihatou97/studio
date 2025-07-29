
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
import { Trash2, Sparkles, Wand2, BriefcaseMedical, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { suggestProcedureCodeAction } from "@/ai/actions";
import { AiPrepopulation } from "../ai-prepopulation";
import { calculateNumberOfDays } from "@/lib/utils";

interface OrClinicConfigProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

export function OrClinicConfig({ appState, setAppState }: OrClinicConfigProps) {
  const { general, orCases, staff, clinicAssignments } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  const [newCase, setNewCase] = useState<Omit<OrCase, 'surgeon'>>({ diagnosis: '', procedure: '', procedureCode: '', complexity: 'routine', patientMrn: '', patientSex: 'male', age: 0 });
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>('');
  
  const [newClinic, setNewClinic] = useState<Partial<ClinicAssignment>>({ appointments: 10, virtualAppointments: 0 });
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);
  const { toast } = useToast();

  const numberOfDays = calculateNumberOfDays(startDate, endDate);
  
  if (numberOfDays === 0) {
    return (
        <AccordionItem value="or-clinic-config">
            <AccordionTrigger className="text-lg font-medium flex items-center gap-2"><BriefcaseMedical />OR & Clinic Configuration</AccordionTrigger>
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
    setAppState(prev => {
        if (!prev) return null;
        const newOrCases = { ...prev.orCases };
        const dayIndex = currentEditingDay;
        if (!newOrCases[dayIndex]) {
          newOrCases[dayIndex] = [];
        }
        newOrCases[dayIndex].push(fullCase);
        return { ...prev, orCases: newOrCases };
    });
    setNewCase({ diagnosis: '', procedure: '', procedureCode: '', complexity: 'routine', patientMrn: '', patientSex: 'male', age: 0 });
    setSelectedSurgeon('');
  };
  
  const handleRemoveCase = (dayIndex: number, caseIndex: number) => {
    setAppState(prev => {
        if (!prev) return null;
        const newOrCases = { ...prev.orCases };
        newOrCases[dayIndex].splice(caseIndex, 1);
        return { ...prev, orCases: newOrCases };
    });
  };
  
  const handleAddClinic = () => {
    if (currentEditingDay === null || !newClinic.staffName || !newClinic.clinicType) return;
    const fullClinic: ClinicAssignment = {
        day: currentEditingDay + 1, // Store as 1-indexed
        staffName: newClinic.staffName,
        clinicType: newClinic.clinicType,
        appointments: newClinic.appointments || 0,
        virtualAppointments: newClinic.virtualAppointments || 0
    };
    setAppState(prev => prev ? ({ ...prev, clinicAssignments: [...prev.clinicAssignments, fullClinic]}) : null);
    setNewClinic({ appointments: 10, virtualAppointments: 0 });
  };

  const handleRemoveClinic = (day: number, staffName: string, clinicType: string) => {
    setAppState(prev => prev ? ({ ...prev, clinicAssignments: prev.clinicAssignments.filter(c => !(c.day === day && c.staffName === staffName && c.clinicType === clinicType)) }) : null);
  };

  const handleSuggestCode = async () => {
    if (!newCase.procedure) {
        toast({variant: 'destructive', title: 'Please enter a procedure description first.'});
        return;
    }
    setIsSuggestingCode(true);
    const result = await suggestProcedureCodeAction(newCase.procedure);
    if (result.success && result.data) {
        setNewCase(c => ({...c, procedureCode: result.data.suggestedCode}));
        toast({title: `Suggested Code: ${result.data.suggestedCode}`, description: result.data.rationale});
    } else {
        toast({variant: 'destructive', title: 'Suggestion Failed', description: result.error});
    }
    setIsSuggestingCode(false);
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
      <AccordionTrigger className="text-lg font-medium flex items-center gap-2"><BriefcaseMedical />OR & Clinic Configuration</AccordionTrigger>
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
                                  <p className="font-semibold">{c.staffName} ({c.clinicType})</p>
                                  <p className="text-sm text-muted-foreground">Appts: {c.appointments} (Virtual: {c.virtualAppointments})</p>
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
                             <div>
                                <Label>Total Appointments</Label>
                                <Input type="number" value={newClinic.appointments} onChange={e => setNewClinic(c => ({ ...c, appointments: parseInt(e.target.value, 10) || 0 }))}/>
                            </div>
                             <div>
                                <Label>Virtual Appointments</Label>
                                <Input type="number" value={newClinic.virtualAppointments} onChange={e => setNewClinic(c => ({ ...c, virtualAppointments: parseInt(e.target.value, 10) || 0 }))}/>
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
      
        <AiPrepopulation 
            appState={appState} 
            setAppState={setAppState} 
            dataType="or-clinic"
            title="Upload OR/Clinic Slate"
            description="Upload an image of the OR schedule for a specific day or week. Include surgeon, patient info, and procedure."
        />
        
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-3">Daily OR Case Schedule</h3>
            <Dialog>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[...Array(numberOfDays)].map((_, i) => <OrDayButton key={i} i={i} />)}
            </div>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                <DialogTitle>Manage OR Cases for Day {currentEditingDay !== null ? new Date(new Date(startDate).setDate(new Date(startDate).getDate() + currentEditingDay)).toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-[50vh] overflow-y-auto p-1">
                {currentEditingDay !== null && (orCases[currentEditingDay] || []).map((c, i) => (
                    <div key={i} className="p-2 bg-muted rounded-md flex justify-between items-center">
                    <div>
                        <p className="font-semibold">{c.procedure} <span className="font-normal text-muted-foreground">({c.procedureCode})</span></p>
                        <p className="text-sm text-muted-foreground">{c.surgeon} | Dx: {c.diagnosis} | <span className="capitalize font-medium">{c.complexity}</span></p>
                        <p className="text-xs text-muted-foreground">Patient: {c.patientMrn} ({c.age}yo {c.patientSex})</p>
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
                            <Label>Case Complexity</Label>
                            <Select value={newCase.complexity} onValueChange={(val: 'routine' | 'complex') => setNewCase(c => ({ ...c, complexity: val }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="routine">Routine</SelectItem>
                                    <SelectItem value="complex">Complex</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:col-span-2">
                            <Label>Diagnosis</Label>
                            <Input value={newCase.diagnosis} onChange={e => setNewCase(c => ({...c, diagnosis: e.target.value}))}/>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div className="sm:col-span-2">
                               <Label>Approach / Procedure</Label>
                               <Input value={newCase.procedure} onChange={e => setNewCase(c => ({...c, procedure: e.target.value}))} />
                            </div>
                             <div>
                               <Label>CPT Code</Label>
                               <div className="flex gap-2">
                                <Input value={newCase.procedureCode} onChange={e => setNewCase(c => ({...c, procedureCode: e.target.value}))} />
                                <Button variant="outline" size="icon" onClick={handleSuggestCode} disabled={isSuggestingCode}>
                                    {isSuggestingCode ? <Loader2 className="animate-spin"/> : <Wand2 />}
                                </Button>
                               </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                                <Label>Patient MRN</Label>
                                <Input value={newCase.patientMrn} onChange={e => setNewCase(c => ({...c, patientMrn: e.target.value}))}/>
                            </div>
                             <div>
                                <Label>Patient Age</Label>
                                <Input type="number" value={newCase.age} onChange={e => setNewCase(c => ({...c, age: parseInt(e.target.value, 10) || 0}))}/>
                            </div>
                            <div>
                                <Label>Patient Sex</Label>
                                <Select value={newCase.patientSex} onValueChange={(val: 'male' | 'female' | 'other') => setNewCase(c => ({...c, patientSex: val}))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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

    