import { useEffect } from 'react';
import type { AppState, Resident } from '@/lib/types';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Trash2 } from 'lucide-react';

interface ResidentCardProps {
  resident: Resident;
  updateResident: (id: string, updatedResident: Partial<Resident>) => void;
  removeResident: (id: string) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ResidentCard({ resident, updateResident, removeResident, appState }: ResidentCardProps) {
  
  const { numberOfDays } = (() => {
    const start = new Date(appState.general.startDate);
    const end = new Date(appState.general.endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return { numberOfDays: 0 };
    return { numberOfDays: Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 };
  })();

  const calculatedMaxCalls = (() => {
    const vacationDaysCount = resident.vacationDays.length;
    const daysOnService = numberOfDays - vacationDaysCount;
    
    if (resident.type === 'non-neuro' && resident.exemptFromCall) return 0;
    
    if (resident.onService) {
      for (const rule of appState.onServiceCallRules) {
        if (daysOnService >= rule.minDays && daysOnService <= rule.maxDays) {
          return rule.calls;
        }
      }
      return 0;
    } else {
      return resident.offServiceMaxCall;
    }
  })();
  
  const handleVacationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vacationDays = e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    updateResident(resident.id, { vacationDays });
  };
  
  const handleChiefChange = (value: string) => {
    const isChief = value === resident.id;
    // Unset other chiefs
    const updatedResidents = appState.residents.map(r => 
        r.id === resident.id ? {...r, isChief} : {...r, isChief: false}
    );
     // Bit of a hack, but we need to update the whole array
    appState.residents.forEach(r => updateResident(r.id, { isChief: r.id === resident.id }));
  }

  const cardClasses = resident.type === 'neuro'
    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
    : 'bg-teal-50 dark:bg-teal-900/50 border-teal-200 dark:border-teal-700';
  
  const isChief = appState.residents.find(r => r.id === resident.id)?.isChief ?? false;

  return (
    <div className={`resident-entry flex flex-col space-y-3 p-3 rounded-lg border ${cardClasses} ${isChief ? 'border-2 border-yellow-400 dark:border-yellow-500' : ''}`}>
      <div className="flex items-center space-x-3">
        {resident.type === 'neuro' ? (
          <Input placeholder="Resident Name" value={resident.name} onChange={(e) => updateResident(resident.id, { name: e.target.value })} className="flex-grow" />
        ) : (
          <>
            <Input placeholder="Name" value={resident.name} onChange={(e) => updateResident(resident.id, { name: e.target.value })} className="w-1/3" />
            <Input placeholder="Specialty" value={resident.specialty} onChange={(e) => updateResident(resident.id, { specialty: e.target.value })} className="w-1/3" />
          </>
        )}
        <Select value={String(resident.level)} onValueChange={(val) => updateResident(resident.id, { level: parseInt(val) })}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="PGY" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map(l => <SelectItem key={l} value={String(l)}>PGY-{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" size="icon" onClick={() => removeResident(resident.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-3">
        {resident.type === 'neuro' && (
             <div className="flex-grow">
                <Label>Status</Label>
                <Select value={String(resident.onService)} onValueChange={(val) => updateResident(resident.id, { onService: val === 'true' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="true">On Service</SelectItem>
                    <SelectItem value="false">Off Service</SelectItem>
                </SelectContent>
                </Select>
            </div>
        )}
        <div className="flex-grow">
          <Label>Vacation (by day #)</Label>
          <Input type="text" placeholder="e.g., 5, 12, 19" value={resident.vacationDays.join(', ')} onChange={handleVacationChange} />
        </div>
      </div>
      
      <div className="call-rules-container grid grid-cols-2 gap-x-4 items-end">
        <div>
          <Label>Calculated Max Calls</Label>
          <div className="font-bold text-lg p-1 text-primary">{calculatedMaxCalls}</div>
        </div>
        {resident.type === 'neuro' && !resident.onService && (
          <div>
            <Label>Off-Service Max Calls</Label>
            <Input type="number" value={resident.offServiceMaxCall} onChange={(e) => updateResident(resident.id, { offServiceMaxCall: parseInt(e.target.value) })} />
          </div>
        )}
        {resident.type === 'non-neuro' && (
            <div className="flex items-center space-x-2 justify-self-start">
                <Switch id={`exempt-call-${resident.id}`} checked={resident.exemptFromCall} onCheckedChange={(checked) => updateResident(resident.id, { exemptFromCall: checked })} />
                <Label htmlFor={`exempt-call-${resident.id}`}>Exempt from Call</Label>
            </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t">
        {resident.level === 1 && resident.type === 'neuro' && (
          <div className="flex items-center space-x-2">
            <Switch 
              id={`allow-solo-${resident.id}`} 
              checked={resident.allowSoloPgy1Call} 
              onCheckedChange={(checked) => updateResident(resident.id, { allowSoloPgy1Call: checked })} 
            />
            <Label htmlFor={`allow-solo-${resident.id}`} className="text-sm">Allow solo PGY-1 call without senior backup</Label>
          </div>
        )}

        {resident.level === 3 && resident.type === 'neuro' && (
          <div className="flex items-center space-x-2">
            <Switch 
              id={`can-backup-${resident.id}`} 
              checked={resident.canBeBackup} 
              onCheckedChange={(checked) => updateResident(resident.id, { canBeBackup: checked })} 
            />
            <Label htmlFor={`can-backup-${resident.id}`} className="text-sm">Can act as backup</Label>
          </div>
        )}
      </div>


      {resident.type === 'neuro' && (
        <>
            <div className="flex items-center space-x-2 pt-2 border-t">
                <RadioGroup onValueChange={handleChiefChange} value={isChief ? resident.id : ''}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value={resident.id} id={`chief-radio-${resident.id}`} />
                        <Label htmlFor={`chief-radio-${resident.id}`} className="font-medium text-yellow-600 dark:text-yellow-400">Set as Chief</Label>
                    </div>
                </RadioGroup>
            </div>
            {isChief && (
                <div className="chief-or-days-container bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded-md">
                    <Label className="font-semibold text-yellow-600 dark:text-yellow-400">Chief's Chosen OR Days (by day #)</Label>
                    <Input 
                      type="text" 
                      className="mt-1"
                      value={resident.chiefOrDays.join(', ')}
                      onChange={(e) => updateResident(resident.id, { chiefOrDays: e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)) })}
                    />
                </div>
            )}
        </>
      )}
    </div>
  );
}
