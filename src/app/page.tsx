"use client";

import { useState } from 'react';
import type { AppState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { generateSchedules } from '@/lib/schedule-generator';
import { useToast } from "@/hooks/use-toast";
import { AppHeader } from '@/components/app-header';
import { AiPrepopulation } from '@/components/ai-prepopulation';
import { GeneralSettings } from '@/components/config-sections/general-settings';
import { ResidentsConfig } from '@/components/config-sections/residents-config';
import { StaffConfig } from '@/components/config-sections/staff-config';
import { OrClinicConfig } from '@/components/config-sections/or-clinic-config';
import { ActionButtons } from '@/components/action-buttons';
import { ScheduleDisplay } from '@/components/schedule-display';
import { initialAppState } from '@/lib/config-helpers';

export default function Home() {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const handleGenerateClick = () => {
    setIsLoading(true);
    setHasGenerated(false);

    // Simulate generation delay
    setTimeout(() => {
      try {
        const output = generateSchedules(appState);
        setAppState(prev => ({
          ...prev,
          residents: output.residents,
          medicalStudents: output.medicalStudents,
          otherLearners: output.otherLearners,
          errors: output.errors,
        }));
        setHasGenerated(true);

        if (output.errors.length > 0) {
          toast({
            variant: "destructive",
            title: "Schedule Generated with Issues",
            description: (
              <ul className="list-disc list-inside">
                {output.errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            ),
          });
        } else {
          toast({
            title: "Schedule Generated Successfully",
            description: "All schedules have been created without conflicts.",
          });
        }
      } catch (e) {
        const error = e as Error;
        toast({
          variant: "destructive",
          title: "An Error Occurred",
          description: error.message || "Failed to generate schedules.",
        });
      } finally {
        setIsLoading(false);
      }
    }, 500);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Configuration</CardTitle>
            <CardDescription>
              Configure residents, staff, vacations, and activities to generate a fair, balanced schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <AiPrepopulation setAppState={setAppState} />
            <Separator />
            <div className="grid md:grid-cols-2 gap-8">
              <GeneralSettings appState={appState} setAppState={setAppState} />
              <ResidentsConfig appState={appState} setAppState={setAppState} />
            </div>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <StaffConfig appState={appState} setAppState={setAppState} />
              <OrClinicConfig appState={appState} setAppState={setAppState} />
            </Accordion>
          </CardContent>
        </Card>

        <ActionButtons
          onGenerate={handleGenerateClick}
          appState={appState}
          isLoading={isLoading}
          hasGenerated={hasGenerated}
        />

        {isLoading && (
          <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p>Generating schedules...</p>
            </div>
          </div>
        )}
        
        {hasGenerated ? (
          <ScheduleDisplay appState={appState} setAppState={setAppState} />
        ) : (
          !isLoading && (
            <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8">
              <p>Generate schedules to view them here.</p>
            </div>
          )
        )}
      </main>
    </div>
  );
}
