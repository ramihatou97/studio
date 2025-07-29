
import type { AppState } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Accordion } from "@/components/ui/accordion";
import { OnServiceCallRules } from "./on-service-call-rules";
import { Switch } from "../ui/switch";

interface GeneralSettingsProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

export function GeneralSettings({ appState, setAppState }: GeneralSettingsProps) {
  const handleGeneralChange = (field: string, value: any) => {
    setAppState(prev => prev ? ({ ...prev, general: { ...prev.general, [field]: value } }) : null);
  };
  
  const { general } = appState;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="rotation-start-date">Rotation Start Date</Label>
            <Input type="date" id="rotation-start-date" value={general.startDate} onChange={(e) => handleGeneralChange('startDate', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="rotation-end-date">Rotation End Date</Label>
            <Input type="date" id="rotation-end-date" value={general.endDate} onChange={(e) => handleGeneralChange('endDate', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="stat-holidays">Statutory Holidays (comma-separated date numbers)</Label>
            <Input type="text" id="stat-holidays" placeholder="e.g., 1, 25" value={general.statHolidays} onChange={(e) => handleGeneralChange('statHolidays', e.target.value)} />
          </div>
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <OnServiceCallRules appState={appState} setAppState={setAppState} />
      </Accordion>
    </div>
  );
}
