
import type { AppState, Staff, StaffCall, ResidentCall } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { PlusCircle, Trash2, Brain, Bone, User, Sun, Moon, Shield } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, getMonth, getYear } from 'date-fns';
import { AiPrepopulation } from "../ai-prepopulation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { cn } from "@/lib/utils";

interface StaffConfigProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

interface StaffInputState {
  name: string;
  subspecialty: string;
  specialtyType: 'cranial' | 'spine' | 'other';
}

function StaffCallScheduler({ appState, setAppState }: { appState: AppState, setAppState: (updater: React.SetStateAction<AppState | null>) => void }) {
  const { general, staff, staffCall } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  
  const allStaff = staff;

  const { numberOfDays } = (() => {
    if (!startDate || !endDate) return { numberOfDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();

  const handleStaffCallChange = (day: number, callType: 'cranial' | 'spine', staffName: string) => {
    setAppState(prev => {
        if (!prev) return null;
        const otherCalls = prev.staffCall.filter(c => !(c.day === day && c.callType === callType));
        if (staffName && staffName !== 'none') {
            return { ...prev, staffCall: [...otherCalls, { day, callType, staffName }] };
        } else {
            return { ...prev, staffCall: otherCalls };
        }
    });
  };

  const DayButton = ({ dayNumber }: { dayNumber: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayNumber -1);
    const dayOfMonth = d.getDate();
    const cranialCall = staffCall.find(c => c.day === dayNumber && c.callType === 'cranial');
    const spineCall = staffCall.find(c => c.day === dayNumber && c.callType === 'spine');
    
    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative text-left items-start p-2" onClick={() => setCurrentEditingDay(dayNumber)}>
            <div className="font-bold text-md">{dayOfMonth}</div>
            <div className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="mt-1 space-y-1 text-xs w-full overflow-hidden">
                {cranialCall && <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                        <Brain className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={cranialCall.staffName}>{cranialCall.staffName}</span>
                    </div>}
                 {spineCall && <div className="flex items-center gap-1.5 text-blue-500 dark:text-blue-400">
                        <Bone className="w-4 h-4 flex-shrink-0" />
                        <span className="font-medium truncate" title={spineCall.staffName}>{spineCall.staffName}</span>
                    </div>}
            </div>
          </Button>
        </DialogTrigger>
    );
  };
  
  if (numberOfDays === 0) {
    return <p className="text-muted-foreground italic text-center mt-4">Please set a valid date range to configure staff call.</p>;
  }

  return (
    <Dialog>
        <div className="mt-6 border-t pt-6">
            <h3 className="text-lg font-medium mb-3">Staff On-Call Schedule</h3>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[...Array(numberOfDays)].map((_, i) => <DayButton key={i} dayNumber={i + 1} />)}
            </div>
        </div>

        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Manage Staff Call for Day {currentEditingDay}</DialogTitle>
            </DialogHeader>
            {currentEditingDay !== null && (
                <div className="space-y-4 pt-4">
                    <div>
                        <Label className="flex items-center gap-2 font-semibold"><Brain className="w-5 h-5 text-red-500"/> Cranial Call</Label>
                        <Select 
                            value={staffCall.find(c => c.day === currentEditingDay && c.callType === 'cranial')?.staffName || 'none'}
                            onValueChange={val => handleStaffCallChange(currentEditingDay, 'cranial', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select staff..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {allStaff.filter(s => s.specialtyType === 'cranial' || s.specialtyType === 'other').map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="flex items-center gap-2 font-semibold"><Bone className="w-5 h-5 text-blue-500"/> Spine Call</Label>
                        <Select
                            value={staffCall.find(c => c.day === currentEditingDay && c.callType === 'spine')?.staffName || 'none'}
                            onValueChange={val => handleStaffCallChange(currentEditingDay, 'spine', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select staff..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {allStaff.filter(s => s.specialtyType === 'spine' || s.specialtyType === 'other').map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}

function ResidentCallScheduler({ appState, setAppState }: { appState: AppState, setAppState: (updater: React.SetStateAction<AppState | null>) => void }) {
  const { general, residents, residentCall } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  const neuroResidents = residents.filter(r => r.type === 'neuro');

  const { numberOfDays } = (() => {
    if (!startDate || !endDate) return { numberOfDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();

  const handleResidentCallChange = (day: number, callType: 'Day Call' | 'Night Call' | 'Weekend Call' | 'Backup', residentId: string) => {
    setAppState(prev => {
        if (!prev) return null;

        const callExists = prev.residentCall.some(c => c.day === day && c.callType === callType && c.residentId === residentId);

        let newResidentCall: ResidentCall[];
        if (callExists) {
            newResidentCall = prev.residentCall.filter(c => !(c.day === day && c.callType === callType && c.residentId === residentId));
        } else {
            // For Day and Night calls, only one resident can be assigned.
            if (callType === 'Day Call' || callType === 'Night Call') {
                newResidentCall = prev.residentCall.filter(c => !(c.day === day && c.callType === callType));
                newResidentCall.push({ day, callType, residentId });
            } else {
                 newResidentCall = [...prev.residentCall, { day, callType, residentId }];
            }
        }
        
        return { ...prev, residentCall: newResidentCall };
    });
  };

  const getResidentName = (id: string) => residents.find(r => r.id === id)?.name;

  const DayButton = ({ dayNumber }: { dayNumber: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + dayNumber - 1);
    const dayOfMonth = d.getDate();
    const dayCalls = residentCall.filter(c => c.day === dayNumber && c.callType === 'Day Call');
    const nightCalls = residentCall.filter(c => c.day === dayNumber && c.callType === 'Night Call');
    const weekendCalls = residentCall.filter(c => c.day === dayNumber && c.callType === 'Weekend Call');

    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative text-left items-start p-2" onClick={() => setCurrentEditingDay(dayNumber)}>
            <div className="font-bold text-md">{dayOfMonth}</div>
            <div className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="mt-1 space-y-1 text-xs w-full overflow-hidden">
                {weekendCalls.map(c => <div key={c.residentId} className="flex items-center gap-1.5 text-destructive font-semibold"><Shield className="w-4 h-4 shrink-0" /><span className="truncate">{getResidentName(c.residentId)}</span></div>)}
                {dayCalls.map(c => <div key={c.residentId} className="flex items-center gap-1.5 text-amber-700 dark:text-amber-500"><Sun className="w-4 h-4 shrink-0" /><span className="truncate">{getResidentName(c.residentId)}</span></div>)}
                {nightCalls.map(c => <div key={c.residentId} className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400"><Moon className="w-4 h-4 shrink-0" /><span className="truncate">{getResidentName(c.residentId)}</span></div>)}
            </div>
          </Button>
        </DialogTrigger>
    );
  };
  
  if (numberOfDays === 0) {
    return <p className="text-muted-foreground italic text-center mt-4">Please set a valid date range.</p>;
  }

  return (
    <Dialog>
      <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-medium mb-3">Resident On-Call Schedule</h3>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {[...Array(numberOfDays)].map((_, i) => <DayButton key={i} dayNumber={i + 1} />)}
          </div>
      </div>
      <DialogContent className="max-w-xl">
         <DialogHeader>
           <DialogTitle>Manage Resident Call for Day {currentEditingDay}</DialogTitle>
         </DialogHeader>
         {currentEditingDay !== null && (
          <div className="space-y-4 pt-4 max-h-[60vh] overflow-y-auto">
            {(['Day Call', 'Night Call', 'Weekend Call', 'Backup'] as const).map(callType => {
              const assignedResidents = residentCall.filter(c => c.day === currentEditingDay && c.callType === callType).map(c => c.residentId);
              return (
                <div key={callType}>
                  <Label className="font-semibold">{callType}</Label>
                  <div className="space-y-1 mt-2">
                      {neuroResidents.map(res => (
                        <div key={res.id} className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-muted">
                          <input 
                            type="checkbox" 
                            id={`${callType}-${res.id}`} 
                            checked={assignedResidents.includes(res.id)} 
                            onChange={() => handleResidentCallChange(currentEditingDay, callType, res.id)} 
                          />
                          <label htmlFor={`${callType}-${res.id}`} className="text-sm w-full cursor-pointer">{res.name} (PGY-{res.level})</label>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
         )}
      </DialogContent>
    </Dialog>
  );
}


export function StaffConfig({ appState, setAppState }: StaffConfigProps) {
  const [staffInput, setStaffInput] = useState<StaffInputState>({ name: '', subspecialty: '', specialtyType: 'other' });
  const { staff } = appState;
  const { toast } = useToast();

  const addStaffMember = () => {
    if (!staffInput.name) return;
    
    const newStaff: Staff = { 
        id: uuidv4(), 
        name: staffInput.name, 
        email: `${staffInput.name.toLowerCase().replace(/\s/g, '.')}@medishift.com`,
        subspecialty: staffInput.subspecialty || 'N/A',
        specialtyType: staffInput.specialtyType
    };
    
    setAppState(prev => prev ? ({ ...prev, staff: [...prev.staff, newStaff] }) : null);
    setStaffInput({ name: '', subspecialty: '', specialtyType: 'other' });
  };
  
  const removeStaffMember = (id: string) => {
    setAppState(prev => prev ? ({ ...prev, staff: appState.staff.filter(s => s.id !== id) }) : null);
  };
  
  const getSpecialtyBadgeClass = (type: 'cranial' | 'spine' | 'other') => {
      switch(type) {
          case 'cranial': return 'border-red-400 text-red-700 bg-red-100 dark:border-red-600 dark:text-red-300 dark:bg-red-900/50';
          case 'spine': return 'border-blue-400 text-blue-700 bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:bg-blue-900/50';
          default: return 'border-gray-400 text-gray-700 bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:bg-gray-900/50';
      }
  }

  const handleCallDataParsed = (data: any) => {
    setAppState(prev => {
        if (!prev) return null;
        let newStaffCall: StaffCall[] = [...prev.staffCall];
        let newResidentCall: ResidentCall[] = [...prev.residentCall];
        let staffCount = 0;
        let residentCount = 0;

        if (data.staffCall) {
            data.staffCall.forEach((call: any) => {
                const dayIndex = call.day - 1;
                staffCount++;
                newStaffCall = newStaffCall.filter(c => !(c.day === (dayIndex + 1) && c.callType === call.callType));
                newStaffCall.push({ day: dayIndex + 1, callType: call.callType, staffName: call.staffName });
            });
        }
        
        if (data.residentCall) {
            data.residentCall.forEach((call: any) => {
                const dayIndex = call.day - 1;
                const resident = prev.residents.find(r => r.name === call.residentName);
                if (resident) {
                    residentCount++;
                    const callType = call.callType;
                    if (callType) {
                       newResidentCall = newResidentCall.filter(c => !(c.day === (dayIndex + 1) && c.residentId === resident.id));
                       newResidentCall.push({ day: dayIndex + 1, callType, residentId: resident.id });
                    }
                }
            });
        }

        toast({ title: "Success", description: `Populated ${staffCount} staff and ${residentCount} resident call assignments.` });
        return { ...prev, staffCall: newStaffCall, residentCall: newResidentCall };
    });
  };

  return (
    <AccordionItem value="staff-config">
      <AccordionTrigger className="text-lg font-medium flex items-center gap-2"><User />Staffing & On-Call Configuration</AccordionTrigger>
      <AccordionContent>
        <Card>
            <CardHeader><CardTitle>Manage Staff Members</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 p-2 bg-muted/50 rounded-lg">
                <Input placeholder="Staff Name" value={staffInput.name} onChange={e => setStaffInput(s => ({...s, name: e.target.value}))} />
                <Input placeholder="Subspecialty" value={staffInput.subspecialty} onChange={e => setStaffInput(s => ({...s, subspecialty: e.target.value}))} />
                <Select value={staffInput.specialtyType} onValueChange={(val: 'cranial' | 'spine' | 'other') => setStaffInput(s => ({...s, specialtyType: val}))}>
                    <SelectTrigger className="w-full md:w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cranial">Cranial</SelectItem>
                        <SelectItem value="spine">Spine</SelectItem>
                        <SelectItem value="other">Other/General</SelectItem>
                    </SelectContent>
                </Select>
                <Button size="icon" onClick={addStaffMember}><PlusCircle/></Button>
              </div>
              <div className="space-y-2">
                {staff.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-2 border rounded-lg bg-background">
                    <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">{s.subspecialty}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getSpecialtyBadgeClass(s.specialtyType)}>{s.specialtyType}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => removeStaffMember(s.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4"/></Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
        </Card>
        
        <AiPrepopulation
          appState={appState}
          setAppState={setAppState}
          onDataParsed={handleCallDataParsed}
          dataType="on-call"
          title="Upload On-Call Schedule"
          description="Upload an image, PDF, or Word Doc of the hospital's official on-call list for the month. The AI will extract and place staff and resident call assignments."
        />
        
        <div className={cn(!appState.general.usePredefinedCall && "hidden")}>
           <ResidentCallScheduler appState={appState} setAppState={setAppState} />
        </div>

        <StaffCallScheduler appState={appState} setAppState={setAppState} />
      </AccordionContent>
    </AccordionItem>
  );
}
