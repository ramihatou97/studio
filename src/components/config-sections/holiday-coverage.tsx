
import { useMemo, useState } from 'react';
import type { AppState } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '../ui/button';

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
  
  const eligibleResidents = residents.filter(r => r.type === 'neuro' && r.onService && r.level >= 2);
  
  const christmasCount = eligibleResidents.filter(r => r.holidayGroup === 'christmas').length;
  const newYearCount = eligibleResidents.filter(r => r.holidayGroup === 'new_year').length;

  return (
    <AccordionItem value="holiday-coverage">
      <AccordionTrigger className="text-lg font-medium">Holiday Coverage Assignments (Dec/Jan)</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Info className="w-4 h-4" />
                    How Holiday Coverage Works
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>How Holiday Coverage Works</DialogTitle>
                    <DialogDescription>
                      The algorithm uses these settings to ensure fair holiday call distribution.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground space-y-4 pt-4 max-h-[70vh] overflow-y-auto pr-4">
                      <div>
                          <h5 className="font-semibold text-foreground">1. How to Configure Holiday Coverage</h5>
                          <p className="font-medium mt-2">Define Holiday Blocks:</p>
                          <p>You must first enter the start and end dates for the two holiday periods: the Christmas Block and the New Year&apos;s Block.</p>
                          <p className="font-medium mt-2">Assign Residents to Groups:</p>
                          <p>For each eligible resident, assign them to one of three groups using the dropdown menu:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li><span className="font-semibold">Christmas Group:</span> These residents will be off during the entire Christmas block.</li>
                              <li><span className="font-semibold">New Year&apos;s Group:</span> These residents will be off during the entire New Year&apos;s block.</li>
                              <li><span className="font-semibold">Neither:</span> These residents are not part of the special holiday swap and will follow their normal schedule.</li>
                          </ul>
                      </div>
                      <div>
                          <h5 className="font-semibold text-foreground">2. How the Scheduling Algorithm Applies These Rules</h5>
                          <p>The algorithm treats holiday assignments as a top priority.</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li><span className="font-semibold">Holiday Assignment Lock:</span> The algorithm assigns &quot;Holiday&quot; to every day of the block for residents in the corresponding group. They are then unavailable for any other duties.</li>
                              <li><span className="font-semibold">Reciprocal Call Coverage:</span> During the Christmas Block, only residents from the New Year&apos;s Group (and &quot;Neither&quot; group) are eligible for call. Conversely, during the New Year&apos;s Block, only residents from the Christmas Group (and &quot;Neither&quot;) are eligible for call.</li>
                              <li><span className="font-semibold">Statutory Holidays:</span> Call shifts on specific statutory holidays (e.g., Dec 25, Jan 1) are treated like weekend calls, requiring appropriate junior/senior backup from within the same on-duty holiday group.</li>
                          </ul>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-foreground font-semibold">Note:</p>
                        <p>This configuration will only be applied by the scheduling algorithm if your selected rotation dates overlap with the December/January holiday period.</p>
                      </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
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
