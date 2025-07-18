
"use client";

import { useState, useEffect } from 'react';
import type { AppState, UserRole, PendingUser } from '@/lib/types';
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
import { HolidayCoverage } from '@/components/config-sections/holiday-coverage';
import { ActionButtons } from '@/components/action-buttons';
import { ScheduleDisplay } from '@/components/schedule-display';
import { getInitialAppState, addNeuroResident, addStaffMember } from '@/lib/config-helpers';
import { AboutSection } from '@/components/about-section';
import { UserCheck, UserX } from 'lucide-react';

export default function AppPage() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    setAppState(getInitialAppState());
  }, []);
  
  if (!appState) {
    return (
        <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
            <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p>Loading MediShift...</p>
            </div>
        </div>
    );
  }

  const currentUserRole = appState.currentUser.role;

  const handleGenerateClick = () => {
    setIsLoading(true);
    setHasGenerated(false);

    setTimeout(() => {
      try {
        const output = generateSchedules(appState);
        setAppState(prev => prev ? ({
          ...prev,
          residents: output.residents,
          medicalStudents: output.medicalStudents,
          otherLearners: output.otherLearners,
          errors: output.errors,
        }) : null);
        setHasGenerated(true);

        if (output.errors.length > 0) {
          toast({
            variant: "destructive",
            title: "Schedule Generated with Issues",
            description: (
              <ul className="list-disc list-inside">
                {output.errors.map((error, i) => <li key={i}>{error.message}</li>)}
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
  
  const handleApproval = (userToApprove: PendingUser, approve: boolean) => {
    setAppState(prev => {
        if (!prev) return null;

        const updatedPendingUsers = prev.pendingUsers?.filter(u => u.id !== userToApprove.id) || [];
        
        if (approve) {
            if (userToApprove.role === 'resident') {
                addNeuroResident(setAppState, {
                    name: `${userToApprove.firstName} ${userToApprove.lastName}`,
                    level: userToApprove.pgyLevel,
                });
            } else if (userToApprove.role === 'staff') {
                addStaffMember(setAppState, {
                    name: `${userToApprove.firstName} ${userToApprove.lastName}`,
                    specialtyType: 'other',
                    subspecialty: 'General',
                });
            }
            toast({ title: 'User Approved', description: `${userToApprove.firstName} ${userToApprove.lastName} has been added to the system.` });
            return { ...prev, pendingUsers: updatedPendingUsers };
        } else {
            toast({ variant: 'destructive', title: 'User Denied', description: `${userToApprove.firstName} ${userToApprove.lastName}'s request has been denied.` });
            return { ...prev, pendingUsers: updatedPendingUsers };
        }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader appState={appState} setAppState={setAppState} />
      <main className="container mx-auto p-4 md:p-8">
        
        {currentUserRole === 'program-director' && appState.pendingUsers && appState.pendingUsers.length > 0 && (
            <Card className="mb-8 shadow-lg border-amber-500/50">
                <CardHeader>
                    <CardTitle>Pending User Approvals</CardTitle>
                    <CardDescription>Review and approve or deny new user sign-up requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {appState.pendingUsers.map(user => (
                        <div key={user.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{user.firstName} {user.lastName} <span className="text-sm text-muted-foreground">({user.email})</span></p>
                                <p className="text-sm capitalize text-primary font-medium">{user.role} {user.role === 'resident' && `(PGY-${user.pgyLevel})`}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50" onClick={() => handleApproval(user, true)}><UserCheck className="mr-2 h-4 w-4" /> Approve</Button>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50" onClick={() => handleApproval(user, false)}><UserX className="mr-2 h-4 w-4" /> Deny</Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        )}

        {currentUserRole === 'program-director' && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Configure residents, staff, vacations, and activities to generate a fair, balanced schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <AiPrepopulation setAppState={setAppState} appState={appState} />
              <Separator />
              <div className="grid md:grid-cols-2 gap-8">
                <GeneralSettings appState={appState} setAppState={setAppState} />
                <ResidentsConfig appState={appState} setAppState={setAppState} />
              </div>
              <Accordion type="single" collapsible className="w-full space-y-4">
                <StaffConfig appState={appState} setAppState={setAppState} />
                <OrClinicConfig appState={appState} setAppState={setAppState} />
                <HolidayCoverage appState={appState} setAppState={setAppState} />
              </Accordion>
            </CardContent>
          </Card>
        )}
        
        {currentUserRole === 'staff' && (
             <Card className="mb-8 shadow-lg">
                <CardHeader>
                    <CardTitle>Staff Configuration</CardTitle>
                    <CardDescription>
                        As a staff surgeon, you can configure your on-call, OR, and clinic assignments.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Accordion type="single" collapsible defaultValue="staff-config" className="w-full space-y-4">
                        <StaffConfig appState={appState} setAppState={setAppState} />
                        <OrClinicConfig appState={appState} setAppState={setAppState} />
                    </Accordion>
                </CardContent>
            </Card>
        )}
        
        <ActionButtons
            onGenerate={handleGenerateClick}
            appState={appState}
            setAppState={setAppState}
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
          !isLoading && currentUserRole !== 'resident' && (
            <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8">
              <p>Generate schedules to view them here.</p>
            </div>
          )
        )}
        
        {currentUserRole === 'resident' && !hasGenerated && (
             <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8">
              <p>Your schedule has not been generated yet. Please check back later.</p>
            </div>
        )}

        <AboutSection />
      </main>
    </div>
  );
}
