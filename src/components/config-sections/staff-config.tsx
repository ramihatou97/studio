import type { AppState, Staff } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface StaffConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface StaffInputState {
  name: string;
  subspecialty: string;
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
      </AccordionContent>
    </AccordionItem>
  );
}
