
import type { AppState, Staff, StaffCall, ResidentCall } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, User } from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { AiPrepopulation } from "../ai-prepopulation";
import { Switch } from "../ui/switch";
import { OnCallSchedule } from "../on-call-schedule";

interface StaffConfigProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

interface StaffInputState {
  name: string;
  subspecialty: string;
  specialtyType: 'cranial' | 'spine' | 'other';
}

export function StaffConfig({ appState, setAppState }: StaffConfigProps) {
  const [staffInput, setStaffInput] = useState<StaffInputState>({ name: '', subspecialty: '', specialtyType: 'other' });
  const { staff, general } = appState;

  const handleGeneralChange = (field: string, value: any) => {
    setAppState(prev => prev ? ({ ...prev, general: { ...prev.general, [field]: value } }) : null);
  };

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

  const showCallSchedulers = appState.general.usePredefinedCall || appState.staffCall.length > 0 || appState.residentCall.length > 0;

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
        
        <div className="mt-4 p-4 border rounded-lg">
             <AiPrepopulation
              appState={appState}
              setAppState={setAppState}
              dataType="on-call"
              title="Upload On-Call Schedule"
              description="Upload an image, PDF, or Word Doc of the official on-call list. The AI will populate the schedule below."
            />
            <div className="flex items-center space-x-2 mt-4 p-2 bg-muted/50 rounded-lg">
                <Switch
                  id="use-predefined-call"
                  checked={general.usePredefinedCall}
                  onCheckedChange={(checked) => handleGeneralChange('usePredefinedCall', checked)}
                />
                <Label htmlFor="use-predefined-call" className="text-base font-medium">
                  Use Pre-defined On-Call Schedule
                </Label>
            </div>
            {showCallSchedulers && (
              <div className="mt-4">
                <OnCallSchedule appState={appState} />
              </div>
            )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
