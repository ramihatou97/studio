import type { AppState, OrCase } from "@/lib/types";
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
import { Trash2 } from "lucide-react";

interface OrClinicConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function OrClinicConfig({ appState, setAppState }: OrClinicConfigProps) {
  const { general, clinicSlots, orCases, staff } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  const [newCase, setNewCase] = useState<Omit<OrCase, 'surgeon'>>({ diagnosis: '', procedure: '' });
  const [selectedSurgeon, setSelectedSurgeon] = useState<string>('');

  const { numberOfDays } = (() => {
    if (!startDate || !endDate) return { numberOfDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();

  const allStaff = [...staff.redTeam, ...staff.blueTeam];

  const handleAddCase = () => {
    if (currentEditingDay === null || !selectedSurgeon || !newCase.procedure) return;
    const fullCase: OrCase = { surgeon: selectedSurgeon, ...newCase };
    const newOrCases = { ...orCases };
    if (!newOrCases[currentEditingDay]) {
      newOrCases[currentEditingDay] = [];
    }
    newOrCases[currentEditingDay].push(fullCase);
    setAppState(prev => ({ ...prev, orCases: newOrCases }));
    setNewCase({ diagnosis: '', procedure: '' });
    setSelectedSurgeon('');
  };
  
  const handleRemoveCase = (dayIndex: number, caseIndex: number) => {
    const newOrCases = { ...orCases };
    newOrCases[dayIndex].splice(caseIndex, 1);
    setAppState(prev => ({ ...prev, orCases: newOrCases }));
  };
  
  const DayButton = ({ i }: { i: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    const caseCount = orCases[i]?.length || 0;
    
    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative" onClick={() => setCurrentEditingDay(i)}>
            <span className="font-bold text-lg">{dayOfMonth}</span>
            <span className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
            {caseCount > 0 && <div className="absolute top-1 right-1 text-xs bg-accent text-accent-foreground rounded-full h-5 w-5 flex items-center justify-center">{caseCount}</div>}
          </Button>
        </DialogTrigger>
    );
  };

  return (
    <AccordionItem value="or-clinic-config">
      <AccordionTrigger className="text-lg font-medium">OR & Clinic Configuration</AccordionTrigger>
      <AccordionContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {Object.keys(clinicSlots).map(day => (
            <div key={day}>
              <Label className="capitalize font-medium">{day}</Label>
              <Input type="number" className="mt-1 w-full bg-red-100 dark:bg-red-900/50" placeholder="Red" value={clinicSlots[day].red} onChange={e => setAppState(prev => ({...prev, clinicSlots: {...prev.clinicSlots, [day]: {...prev.clinicSlots[day], red: parseInt(e.target.value)}}}))} />
              <Input type="number" className="mt-1 w-full bg-blue-100 dark:bg-blue-900/50" placeholder="Blue" value={clinicSlots[day].blue} onChange={e => setAppState(prev => ({...prev, clinicSlots: {...prev.clinicSlots[day], [day]: {...prev.clinicSlots[day], blue: parseInt(e.target.value)}}}))} />
            </div>
          ))}
        </div>
        
        <Dialog>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {[...Array(numberOfDays)].map((_, i) => <DayButton key={i} i={i} />)}
          </div>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage OR Cases for Day {currentEditingDay !== null ? currentEditingDay + 1 : ''}</DialogTitle>
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
      </AccordionContent>
    </AccordionItem>
  );
}
