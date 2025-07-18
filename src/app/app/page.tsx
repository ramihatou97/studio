
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppState, UserRole, PendingUser, Resident, Staff } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { generateSchedules } from '@/lib/schedule-generator';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';
import { AppHeader } from '@/components/app-header';
import { AiPrepopulation } from '@/components/ai-prepopulation';
import { GeneralSettings } from '@/components/config-sections/general-settings';
import { ResidentsConfig } from '@/components/config-sections/residents-config';
import { StaffConfig } from '@/components/config-sections/staff-config';
import { OrClinicConfig } from '@/components/config-sections/or-clinic-config';
import { HolidayCoverage } from '@/components/config-sections/holiday-coverage';
import { ActionButtons } from '@/components/action-buttons';
import { ScheduleDisplay } from '@/components/schedule-display';
import { getInitialAppState } from '@/lib/config-helpers';
import { AboutSection } from '@/components/about-section';
import { UserCheck, UserX, GraduationCap, BookUser, CalendarDays, ScrollText } from 'lucide-react';
import { EpaModal } from '@/components/modals/epa-modal';
import { ProcedureLogModal } from '@/components/modals/procedure-log-modal';
import { AnalysisModal } from '@/components/modals/analysis-modal';
import { HandoverModal } from '@/components/modals/handover-modal';
import { OptimizerModal } from '@/components/modals/optimizer-modal';
import { ChatModal } from '@/components/modals/chat-modal';
import { LongTermAnalysisModal } from '@/components/modals/long-term-analysis-modal';
import { SurgicalBriefingModal } from '@/components/modals/surgical-briefing-modal';
import { YearlyRotationModal } from '@/components/modals/yearly-rotation-modal';

const MOCK_STATE_KEY = 'mock_app_state';

const getAppStateFromMockDb = (): AppState => {
    if (typeof window === 'undefined') return getInitialAppState();
    const storedStateJSON = localStorage.getItem(MOCK_STATE_KEY);
    try {
        if (storedStateJSON) {
            const parsed = JSON.parse(storedStateJSON);
            // Basic validation
            if (parsed.general && parsed.residents) {
                return parsed;
            }
        }
    } catch (e) {
        console.error("Failed to parse mock state from localStorage", e);
    }
    return getInitialAppState();
}

const getCurrentUserFromMockDb = (): AppState['currentUser'] | null => {
    if (typeof window === 'undefined') return null;
    const storedUser = localStorage.getItem('currentUser');
    try {
        if (storedUser) {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Failed to parse current user from localStorage", e);
    }
    return null;
}

const saveAppStateToMockDb = (state: AppState) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(MOCK_STATE_KEY, JSON.stringify(state));
        if (state.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
        }
    } catch (e) {
        console.error("Failed to save state to localStorage", e);
    }
}

export default function AppPage() {
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isEpaModalOpen, setEpaModalOpen] = useState(false);
  const [isProcedureLogModalOpen, setProcedureLogModalOpen] = useState(false);
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [isHandoverModalOpen, setHandoverModalOpen] = useState(false);
  const [isOptimizerModalOpen, setOptimizerModalOpen] = useState(false);
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isLongTermAnalysisModalOpen, setLongTermAnalysisModalOpen] = useState(false);
  const [isSurgicalBriefingModalOpen, setSurgicalBriefingModalOpen] = useState(false);
  const [isYearlyRotationModalOpen, setYearlyRotationModalOpen] = useState(false);
  
  const [showMobileSchedule, setShowMobileSchedule] = useState(false);
  const [showMobileStaffConfig, setShowMobileStaffConfig] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loggedInUser = getCurrentUserFromMockDb();
    if (!loggedInUser) {
      router.replace('/login');
    } else {
      const fullState = getAppStateFromMockDb();
      // Ensure currentUser is always up-to-date from its dedicated storage
      setAppState({ ...fullState, currentUser: loggedInUser });
      // Check if a schedule has been generated previously
      const scheduleExists = fullState.residents.some(r => r.schedule && r.schedule.length > 0);
      setHasGenerated(scheduleExists);
    }
  }, [router]);
  
  useEffect(() => {
    if (appState) {
        saveAppStateToMockDb(appState);
    }
  }, [appState]);
  
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
        let newState = { ...prev, pendingUsers: updatedPendingUsers };
        if (approve) {
            if (userToApprove.role === 'resident') {
                const newResident: Resident = {
                    id: userToApprove.id, type: 'neuro', name: `${userToApprove.firstName} ${userToApprove.lastName}`, email: userToApprove.email, level: userToApprove.pgyLevel || 1, onService: true, isChief: false, chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0
                };
                newState.residents = [...newState.residents, newResident];
            } else if (userToApprove.role === 'staff') {
                const newStaff: Staff = {
                    id: userToApprove.id, name: `${userToApprove.firstName} ${userToApprove.lastName}`, email: userToApprove.email, specialtyType: 'other', subspecialty: 'General',
                };
                newState.staff = [...newState.staff, newStaff];
            }
            toast({ title: 'User Approved', description: `${userToApprove.firstName} ${userToApprove.lastName} has been added.` });
        } else {
            toast({ variant: 'destructive', title: 'User Denied', description: `${userToApprove.firstName} ${userToApprove.lastName}'s request has been denied.` });
        }
        return newState;
    });
  };
  
  const renderResidentMobileDashboard = () => (
    <div className="space-y-4">
        <Button onClick={() => setEpaModalOpen(true)} className="w-full h-24 flex-col text-lg" variant="outline"><GraduationCap className="h-8 w-8 mb-2" /> EPA Evaluations</Button>
        <Button onClick={() => setProcedureLogModalOpen(true)} className="w-full h-24 flex-col text-lg" variant="outline"><BookUser className="h-8 w-8 mb-2" /> Procedure Log</Button>
        <Button onClick={() => setShowMobileSchedule(!showMobileSchedule)} className="w-full h-24 flex-col text-lg" variant="outline"><CalendarDays className="h-8 w-8 mb-2" /> {showMobileSchedule ? 'Hide My Schedule' : 'View My Schedule'}</Button>
        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={setAppState} /> : (
            <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Your schedule has not been generated yet.</p></div>
        ))}
    </div>
  );

  const renderStaffMobileDashboard = () => (
    <div className="space-y-4">
        <Button onClick={() => setEpaModalOpen(true)} className="w-full h-24 flex-col text-lg" variant="outline"><GraduationCap className="h-8 w-8 mb-2" /> EPA Evaluations</Button>
        <Button onClick={() => setShowMobileStaffConfig(!showMobileStaffConfig)} className="w-full h-24 flex-col text-lg" variant="outline"><ScrollText className="h-8 w-8 mb-2" /> {showMobileStaffConfig ? 'Hide My Config' : 'Edit My Schedule'}</Button>
        {showMobileStaffConfig && (
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Staff Configuration</CardTitle><CardDescription>Configure your on-call, OR, and clinic assignments.</CardDescription></CardHeader>
                <CardContent><Accordion type="single" collapsible defaultValue="staff-config" className="w-full space-y-4"><StaffConfig appState={appState} setAppState={setAppState} /><OrClinicConfig appState={appState} setAppState={setAppState} /></Accordion></CardContent>
            </Card>
        )}
        <Button onClick={() => setShowMobileSchedule(!showMobileSchedule)} className="w-full h-24 flex-col text-lg" variant="outline"><CalendarDays className="h-8 w-8 mb-2" /> {showMobileSchedule ? 'Hide Full Schedule' : 'View Full Schedule'}</Button>
        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={setAppState} /> : (
             <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Generate schedules to view them here.</p></div>
        ))}
    </div>
  );

  const renderFullDashboard = () => (
    <>
      {currentUserRole === 'program-director' && appState.pendingUsers && appState.pendingUsers.length > 0 && (
          <Card className="mb-8 shadow-lg border-amber-500/50">
              <CardHeader><CardTitle>Pending User Approvals</CardTitle><CardDescription>Review and approve or deny new user sign-up requests.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                  {appState.pendingUsers.map(user => (
                      <div key={user.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/50 rounded-lg gap-2">
                          <div><p className="font-semibold">{user.firstName} {user.lastName} <span className="text-sm text-muted-foreground">({user.email})</span></p><p className="text-sm capitalize text-primary font-medium">{user.role} {user.role === 'resident' && `(PGY-${user.pgyLevel})`}</p></div>
                          <div className="flex gap-2 self-end sm:self-center"><Button size="sm" variant="outline" className="text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/50" onClick={() => handleApproval(user, true)}><UserCheck className="mr-2 h-4 w-4" /> Approve</Button><Button size="sm" variant="outline" className="text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/50" onClick={() => handleApproval(user, false)}><UserX className="mr-2 h-4 w-4" /> Deny</Button></div>
                      </div>
                  ))}
              </CardContent>
          </Card>
      )}

      {currentUserRole === 'program-director' && (
        <Card className="mb-8 shadow-lg">
          <CardHeader><CardTitle>Configuration</CardTitle><CardDescription>Configure residents, staff, vacations, and activities to generate a fair, balanced schedule.</CardDescription></CardHeader>
          <CardContent className="space-y-8">
            <AiPrepopulation setAppState={setAppState} appState={appState} />
            <Separator />
            <div className="grid md:grid-cols-2 gap-8"><GeneralSettings appState={appState} setAppState={setAppState} /><ResidentsConfig appState={appState} setAppState={setAppState} /></div>
            <Accordion type="single" collapsible className="w-full space-y-4"><StaffConfig appState={appState} setAppState={setAppState} /><OrClinicConfig appState={appState} setAppState={setAppState} /><HolidayCoverage appState={appState} setAppState={setAppState} /></Accordion>
          </CardContent>
        </Card>
      )}

      <ActionButtons onGenerate={handleGenerateClick} appState={appState} setAppState={setAppState} isLoading={isLoading} hasGenerated={hasGenerated} onEpaClick={() => setEpaModalOpen(true)} onProcedureLogClick={() => setProcedureLogModalOpen(true)} onYearlyRotationClick={() => setYearlyRotationModalOpen(true)} onAnalysisClick={() => setAnalysisModalOpen(true)} onOptimizerClick={() => setOptimizerModalOpen(true)} onHandoverClick={() => setHandoverModalOpen(true)} onChatClick={() => setChatModalOpen(true)} onLongTermAnalysisClick={() => setLongTermAnalysisModalOpen(true)} onSurgicalBriefingClick={() => setSurgicalBriefingModalOpen(true)}/>
      
      {isLoading ? (<div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><div className="flex flex-col items-center gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p>Generating schedules...</p></div></div>) 
      : hasGenerated ? (<ScheduleDisplay appState={appState} setAppState={setAppState} />) 
      : (<div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Generate schedules to view them here.</p></div>)}
    </>
  );

  const renderContent = () => {
    if (isMobile) {
      switch (currentUserRole) {
        case 'resident':
          return renderResidentMobileDashboard();
        case 'staff':
          return renderStaffMobileDashboard();
        default:
          return renderFullDashboard(); // Program Director sees full dashboard on mobile too
      }
    }
    return renderFullDashboard(); // All roles see full dashboard on desktop
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader appState={appState} setAppState={setAppState} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
        <AboutSection />
      </main>

      <EpaModal isOpen={isEpaModalOpen} onOpenChange={setEpaModalOpen} appState={appState}/>
      <ProcedureLogModal isOpen={isProcedureLogModalOpen} onOpenChange={setProcedureLogModalOpen} appState={appState} setAppState={setAppState}/>
      <YearlyRotationModal isOpen={isYearlyRotationModalOpen} onOpenChange={setYearlyRotationModalOpen} appState={appState} setAppState={setAppState}/>
      
      {hasGenerated && (
        <>
          <AnalysisModal isOpen={isAnalysisModalOpen} onOpenChange={setAnalysisModalOpen} appState={appState}/>
          <HandoverModal isOpen={isHandoverModalOpen} onOpenChange={setHandoverModalOpen} appState={appState}/>
          <OptimizerModal isOpen={isOptimizerModalOpen} onOpenChange={setOptimizerModalOpen} appState={appState} setAppState={setAppState}/>
          <ChatModal isOpen={isChatModalOpen} onOpenChange={setChatModalOpen} appState={appState}/>
          <LongTermAnalysisModal isOpen={isLongTermAnalysisModalOpen} onOpenChange={setLongTermAnalysisModalOpen} appState={appState}/>
          <SurgicalBriefingModal isOpen={isSurgicalBriefingModalOpen} onOpenChange={setSurgicalBriefingModalOpen} appState={appState}/>
        </>
      )}
    </div>
  );
}
