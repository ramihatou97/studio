import { useMemo } from 'react';
import type { AppState } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface HolidayCoverageProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function HolidayCoverage({ appState, setAppState }: HolidayCoverageProps) {
  const { general, residents } = appState;

  const handleGeneralChange = (field: string, value: any) => {
    setAppState(prev => ({ ...prev, general: { ...prev.general, [field]: value } }));
  };

  const handleHolidayGroupChange = (residentId: string, value: 'christmas' | 'new_year' | 'neither') => {
    setAppState(prev => ({
      ...prev,
      residents: prev.residents.map(r => r.id === residentId ? { ...r, holidayGroup: value } : r)
    }));
  };
  
  const isHolidayCoverageNeeded = useMemo(() => {
    if (!general.startDate || !general.endDate) return false;
    const start = new Date(general.startDate);
    const end = new Date(general.endDate);
    const startYear = start.getFullYear();
    const endYear = end.getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const christmasStart = new Date(year, 11, 20);
      const christmasEnd = new Date(year, 11, 28);
      const newYearStart = new Date(year, 11, 29);
      const newYearEnd = new Date(year + 1, 0, 5);
      if ((start <= christmasEnd && end >= christmasStart) || (start <= newYearEnd && end >= newYearStart)) {
        return true;
      }
    }
    return false;
  }, [general.startDate, general.endDate]);

  if (!isHolidayCoverageNeeded) return null;

  const eligibleResidents = residents.filter(r => r.type === 'neuro' && r.onService && r.level >= 2);
  
  const christmasCount = eligibleResidents.filter(r => r.holidayGroup === 'christmas').length;
  const newYearCount = eligibleResidents.filter(r => r.holidayGroup === 'new_year').length;

  return (
    <AccordionItem value="holiday-coverage">
      <AccordionTrigger className="text-lg font-medium">Holiday Coverage Assignments</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Christmas Block</h4>
                  <div className="flex items-center space-x-2">
                    <Input type="date" value={general.christmasStart} onChange={e => handleGeneralChange('christmasStart', e.target.value)} />
                    <span className="font-bold">to</span>
                    <Input type="date" value={general.christmasEnd} onChange={e => handleGeneralChange('christmasEnd', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">New Year's Block</h4>
                  <div className="flex items-center space-x-2">
                    <Input type="date" value={general.newYearStart} onChange={e => handleGeneralChange('newYearStart', e.target.value)} />
                    <span className="font-bold">to</span>
                    <Input type="date" value={general.newYearEnd} onChange={e => handleGeneralChange('newYearEnd', e.target.value)} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                  {eligibleResidents.length > 0 ? eligibleResidents.map(res => (
                    <div key={res.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                        <Label htmlFor={`holiday-group-${res.id}`} className="font-medium">{res.name || `Resident ${res.id.substring(0,4)}`}</Label>
                        <Select value={res.holidayGroup} onValueChange={(val: any) => handleHolidayGroupChange(res.id, val)}>
                          <SelectTrigger id={`holiday-group-${res.id}`} className="w-36"><SelectValue/></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="neither">Neither</SelectItem>
                              <SelectItem value="christmas">Christmas</SelectItem>
                              <SelectItem value="new_year">New Year's</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                  )) : (
                    <p className="text-muted-foreground italic col-span-full">No PGY-2+ on-service residents available for holiday assignment.</p>
                  )}
                </div>
                <div className="mt-4 text-sm flex justify-end space-x-4 font-semibold">
                    <span>Christmas: {christmasCount}</span>
                    <span>New Year's: {newYearCount}</span>
                </div>
            </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
