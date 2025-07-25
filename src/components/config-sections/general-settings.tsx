
import type { AppState } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OnServiceCallRules } from "./on-service-call-rules";
import { Slider } from "../ui/slider";

interface GeneralSettingsProps {
  appState: AppState;
  setAppState: (updates: Partial<AppState>) => Promise<void>;
}

export function GeneralSettings({ appState, setAppState }: GeneralSettingsProps) {
  const handleGeneralChange = (field: string, value: any) => {
    setAppState({ general: { ...appState.general, [field]: value } });
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
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center space-x-3">
              <Switch id="use-predefined-call-toggle" checked={general.usePredefinedCall} onCheckedChange={(checked) => handleGeneralChange('usePredefinedCall', checked)} />
              <Label htmlFor="use-predefined-call-toggle">Use Pre-defined Monthly On-Call Schedule</Label>
            </div>
             <div>
                <Label htmlFor="reminder-frequency">EPA Reminder Frequency (days)</Label>
                <div className="flex items-center gap-4 pt-2">
                    <Slider
                        id="reminder-frequency"
                        min={1}
                        max={7}
                        step={1}
                        value={[general.reminderFrequency || 3]}
                        onValueChange={(value) => handleGeneralChange('reminderFrequency', value[0])}
                    />
                    <span className="font-bold text-lg w-12 text-center">{general.reminderFrequency}</span>
                </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Accordion type="single" collapsible className="w-full space-y-4">
        <OnServiceCallRules appState={appState} setAppState={setAppState} />
      </Accordion>
    </div>
  );
}
