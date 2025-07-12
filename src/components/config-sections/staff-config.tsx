import type { AppState, Staff, StaffCall } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { PlusCircle, Trash2, Brain, Bone, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { prepopulateStaffCallAction } from "@/lib/actions";

interface StaffConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface StaffInputState {
  name: string;
  subspecialty: string;
}

function AiStaffCallPrepopulation({ appState, setAppState }: { appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const allStaff = [...appState.staff.redTeam, ...appState.staff.blueTeam];

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
    const result = await prepopulateStaffCallAction(text, staffList);

    if (result.success && result.data) {
      setAppState(prev => ({
        ...prev,
        staffCall: result.data as StaffCall[]
      }));
      toast({ title: 'Success', description: `Populated ${result.data.length} staff call assignments.` });
      setText('');
    } else {
      toast({ variant: 'destructive', title: 'Parsing Failed', description: result.error });
    }
    setIsLoading(false);
  };
  
  return (
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 mt-6">
        <h4 className="text-md font-medium mb-2 text-purple-800 dark:text-purple-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Pre-population for Staff Call
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
            Paste the text of an existing staff call schedule to have the AI extract and populate the assignments.
            Include day numbers, call types (cranial/spine), and names.
        </p>
        <Textarea
            rows={4}
            className="mt-1"
            placeholder="e.g., 'July 1: Cranial - Dr. Smith, Spine - Dr. Jones. July 2...'"
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

function StaffCallScheduler({ appState, setAppState }: { appState: AppState, setAppState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const { general, staff, staffCall } = appState;
  const { startDate, endDate } = general;
  const [currentEditingDay, setCurrentEditingDay] = useState<number | null>(null);
  
  const allStaff = [...staff.redTeam, ...staff.blueTeam];

  const { numberOfDays } = (() => {
    if (!startDate || !endDate) return { numberOfDays: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();

  const handleStaffCallChange = (day: number, callType: 'cranial' | 'spine', staffName: string) => {
    setAppState(prev => {
        const otherCalls = prev.staffCall.filter(c => !(c.day === day && c.callType === callType));
        if (staffName) {
            return { ...prev, staffCall: [...otherCalls, { day, callType, staffName }]};
        }
        return { ...prev, staffCall: otherCalls };
    });
  };

  const DayButton = ({ i }: { i: number }) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dayOfMonth = d.getDate();
    const cranialCall = staffCall.find(c => c.day === i && c.callType === 'cranial');
    const spineCall = staffCall.find(c => c.day === i && c.callType === 'spine');
    
    return (
        <DialogTrigger asChild>
          <Button variant="outline" className="h-24 flex-col relative text-left items-start p-2" onClick={() => setCurrentEditingDay(i)}>
            <div className="font-bold text-md">{dayOfMonth}</div>
            <div className="text-xs text-muted-foreground">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className="mt-1 space-y-1 text-xs w-full overflow-hidden">
                {cranialCall && <div className="flex items-center gap-1"><Brain className="w-3 h-3 text-red-500 shrink-0"/> <span className="truncate">{cranialCall.staffName}</span></div>}
                {spineCall && <div className="flex items-center gap-1"><Bone className="w-3 h-3 text-blue-500 shrink-0"/> <span className="truncate">{spineCall.staffName}</span></div>}
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
                {[...Array(numberOfDays)].map((_, i) => <DayButton key={i} i={i} />)}
            </div>
        </div>

        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>Manage Staff Call for Day {currentEditingDay !== null ? currentEditingDay + 1 : ''}</DialogTitle>
            </DialogHeader>
            {currentEditingDay !== null && (
                <div className="space-y-4 pt-4">
                    <div>
                        <Label className="flex items-center gap-2 font-semibold"><Brain className="w-5 h-5 text-red-500"/> Cranial Call</Label>
                        <Select 
                            value={staffCall.find(c => c.day === currentEditingDay && c.callType === 'cranial')?.staffName || ''}
                            onValueChange={val => handleStaffCallChange(currentEditingDay, 'cranial', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select staff..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {allStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label className="flex items-center gap-2 font-semibold"><Bone className="w-5 h-5 text-blue-500"/> Spine Call</Label>
                         <Select
                            value={staffCall.find(c => c.day === currentEditingDay && c.callType === 'spine')?.staffName || ''}
                            onValueChange={val => handleStaffCallChange(currentEditingDay, 'spine', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select staff..."/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {allStaff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
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

export function StaffConfig({ appState, setAppState }: StaffConfigProps) {
  const [redStaffInput, setRedStaffInput] = useState<StaffInputState>({ name: '', subspecialty: '' });
  const [blueStaffInput, setBlueStaffInput] = useState<StaffInputState>({ name: '', subspecialty: '' });
  const { staff } = appState;

  const addStaffMember = (team: 'red' | 'blue') => {
    const inputState = team === 'red' ? redStaffInput : blueStaffInput;
    const setInputState = team === 'red' ? setRedStaffInput : setBlueStaffInput;
    if (!inputState.name) return;
    
    const newStaff: Staff = { id: uuidv4(), name: inputState.name, subspecialty: inputState.subspecialty || 'N/A' };
    
    setAppState(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        [team === 'red' ? 'redTeam' : 'blueTeam']: [...prev.staff[team === 'red' ? 'redTeam' : 'blueTeam'], newStaff]
      }
    }));
    setInputState({ name: '', subspecialty: '' });
  };
  
  const removeStaffMember = (team: 'red' | 'blue', id: string) => {
    setAppState(prev => ({
      ...prev,
      staff: {
        ...prev.staff,
        [team === 'red' ? 'redTeam' : 'blueTeam']: prev.staff[team === 'red' ? 'redTeam' : 'blueTeam'].filter(s => s.id !== id)
      }
    }));
  };

  return (
    <AccordionItem value="staff-config">
      <AccordionTrigger className="text-lg font-medium">Staffing & On-Call Configuration</AccordionTrigger>
      <AccordionContent>
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardHeader><CardTitle className="text-red-800 dark:text-red-300">Red Team Staff</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input placeholder="Staff Name" value={redStaffInput.name} onChange={e => setRedStaffInput(s => ({...s, name: e.target.value}))} />
                <Input placeholder="Subspecialty" value={redStaffInput.subspecialty} onChange={e => setRedStaffInput(s => ({...s, subspecialty: e.target.value}))} />
                <Button size="icon" onClick={() => addStaffMember('red')} className="bg-red-500 hover:bg-red-600"><PlusCircle/></Button>
              </div>
              <div className="space-y-2">
                {staff.redTeam.map(s => (
                  <Badge key={s.id} variant="secondary" className="flex justify-between items-center p-2 text-base">
                    {s.name} <span className="text-xs text-muted-foreground ml-2">({s.subspecialty})</span>
                    <Button variant="ghost" size="icon" onClick={() => removeStaffMember('red', s.id)} className="h-5 w-5 ml-2 hover:bg-red-200 dark:hover:bg-red-800"><Trash2 className="h-3 w-3"/></Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader><CardTitle className="text-blue-800 dark:text-blue-300">Blue Team Staff</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input placeholder="Staff Name" value={blueStaffInput.name} onChange={e => setBlueStaffInput(s => ({...s, name: e.target.value}))} />
                <Input placeholder="Subspecialty" value={blueStaffInput.subspecialty} onChange={e => setBlueStaffInput(s => ({...s, subspecialty: e.target.value}))} />
                <Button size="icon" onClick={() => addStaffMember('blue')} className="bg-blue-500 hover:bg-blue-600"><PlusCircle/></Button>
              </div>
              <div className="space-y-2">
                {staff.blueTeam.map(s => (
                   <Badge key={s.id} variant="secondary" className="flex justify-between items-center p-2 text-base">
                    {s.name} <span className="text-xs text-muted-foreground ml-2">({s.subspecialty})</span>
                    <Button variant="ghost" size="icon" onClick={() => removeStaffMember('blue', s.id)} className="h-5 w-5 ml-2 hover:bg-blue-200 dark:hover:bg-blue-800"><Trash2 className="h-3 w-3"/></Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <AiStaffCallPrepopulation appState={appState} setAppState={setAppState} />
        <StaffCallScheduler appState={appState} setAppState={setAppState} />

      </AccordionContent>
    </AccordionItem>
  );
}
