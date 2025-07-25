
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { AppState, CurrentUser } from '@/lib/types';
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
import { getInitialAppState, ALL_USERS } from '@/lib/config-helpers';
import { AboutSection } from '@/components/about-section';
import { EpaModal } from '@/components/modals/epa-modal';
import { ProcedureLogModal } from '@/components/modals/procedure-log-modal';
import { AnalysisModal } from '@/components/modals/analysis-modal';
import { HandoverModal } from '@/components/modals/handover-modal';
import { OptimizerModal } from '@/components/modals/optimizer-modal';
import { ChatModal } from '@/components/modals/chat-modal';
import { LongTermAnalysisModal } from '@/components/modals/long-term-analysis-modal';
import { SurgicalBriefingModal } from '@/components/modals/surgical-briefing-modal';
import { YearlyRotationModal } from '@/components/modals/yearly-rotation-modal';
import { Loader2, GraduationCap, BookUser, CalendarDays, ScrollText, Users } from 'lucide-react';
import { RoleSwitcher } from '@/components/role-switcher';

// A mock in-memory store.
let memoryState: AppState | null = null;

export default function AppPage() {
  const { toast } = useToast();
  const [appState, setAppState] = useState<AppState | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
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

  const isMobile = useIsMobile();
  
  // Load initial state from our in-memory store
  useEffect(() => {
    if (!memoryState) {
        memoryState = getInitialAppState();
    }
    setAppState(memoryState);
  }, []);

  const updateAppState = (updater: React.SetStateAction<AppState | null>) => {
    setAppState(prevState => {
      const newState = typeof updater === 'function' ? updater(prevState) : updater;
      if (newState) {
        memoryState = newState;
      }
      return newState;
    });
  };

  const handleGenerateClick = () => {
    if (!appState) return;
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const output = generateSchedules(appState);
        
        updateAppState(prev => prev ? ({
          ...prev,
          residents: output.residents,
          medicalStudents: output.medicalStudents,
          otherLearners: output.otherLearners,
          errors: output.errors,
        }) : null);

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
        setIsGenerating(false);
      }
    }, 500);
  };
  
  const hasGenerated = appState?.residents.some(r => r.schedule && r.schedule.length > 0) || false;
  
  if (!appState) {
    return (
        <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary"/>
                <p>Loading MediShift...</p>
            </div>
        </div>
    );
  }

  const handleUserSwitch = (user: CurrentUser) => {
    updateAppState(prev => prev ? { ...prev, currentUser: user } : null);
    toast({
        title: "View Switched",
        description: `You are now viewing the app as ${user.name} (${user.role}).`
    })
  };

  const currentUserRole = appState.currentUser.role;

  const renderResidentMobileDashboard = () => (
    <div className="space-y-4">
        <Card onClick={() => setEpaModalOpen(true)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <GraduationCap className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle>EPA Evaluations</CardTitle>
                    <CardDescription>Complete or request evaluations.</CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card onClick={() => setProcedureLogModalOpen(true)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <BookUser className="h-10 w-10 text-accent" />
                <div>
                    <CardTitle>Procedure Log</CardTitle>
                    <CardDescription>View and manage your case log.</CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card onClick={() => setShowMobileSchedule(!showMobileSchedule)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <CalendarDays className="h-10 w-10 text-orange-500" />
                <div>
                    <CardTitle>{showMobileSchedule ? 'Hide My Schedule' : 'View My Schedule'}</CardTitle>
                    <CardDescription>Check your daily assignments.</CardDescription>
                </div>
            </CardHeader>
        </Card>

        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={updateAppState} /> : (
            <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Your schedule has not been generated yet.</p></div>
        ))}
    </div>
  );

  const renderStaffMobileDashboard = () => (
    <div className="space-y-4">
        <Card onClick={() => setEpaModalOpen(true)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <GraduationCap className="h-10 w-10 text-primary" />
                <div>
                    <CardTitle>EPA Evaluations</CardTitle>
                    <CardDescription>Assess resident performance.</CardDescription>
                </div>
            </CardHeader>
        </Card>
        <Card onClick={() => setShowMobileStaffConfig(!showMobileStaffConfig)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center gap-4">
                <ScrollText className="h-10 w-10 text-purple-500" />
                <div>
                    <CardTitle>{showMobileStaffConfig ? 'Hide My Config' : 'Edit My Schedule'}</CardTitle>
                    <CardDescription>Set on-call, OR, and clinic duties.</CardDescription>
                </div>
            </CardHeader>
        </Card>
        {showMobileStaffConfig && (
            <Card className="shadow-lg">
                <CardHeader><CardTitle>Staff Configuration</CardTitle><CardDescription>Configure your on-call, OR, and clinic assignments.</CardDescription></CardHeader>
                <CardContent>
                    <div className="w-full space-y-4">
                        <StaffConfig appState={appState} setAppState={updateAppState} />
                        <OrClinicConfig appState={appState} setAppState={updateAppState} />
                    </div>
                </CardContent>
            </Card>
        )}
        <Card onClick={() => setShowMobileSchedule(!showMobileSchedule)} className="cursor-pointer hover:bg-muted transition-colors shadow-sm">
             <CardHeader className="flex flex-row items-center gap-4">
                <Users className="h-10 w-10 text-green-500" />
                <div>
                    <CardTitle>{showMobileSchedule ? 'Hide Full Schedule' : 'View Full Schedule'}</CardTitle>
                    <CardDescription>See the complete team roster.</CardDescription>
                </div>
            </CardHeader>
        </Card>
        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={updateAppState} /> : (
             <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Generate schedules to view them here.</p></div>
        ))}
    </div>
  );

  const renderFullDashboard = () => (
    <>
      <Card className="mb-8 shadow-lg">
        <CardHeader><CardTitle>Configuration</CardTitle><CardDescription>Configure residents, staff, vacations, and activities to generate a fair, balanced schedule.</CardDescription></CardHeader>
        <CardContent className="space-y-8">
          <AiPrepopulation setAppState={updateAppState} appState={appState} />
          <Separator />
          <div className="grid md:grid-cols-2 gap-8"><GeneralSettings appState={appState} setAppState={updateAppState} /><ResidentsConfig appState={appState} setAppState={updateAppState} /></div>
          <Accordion type="single" collapsible className="w-full space-y-4"><StaffConfig appState={appState} setAppState={updateAppState} /><OrClinicConfig appState={appState} setAppState={updateAppState} /><HolidayCoverage appState={appState} setAppState={updateAppState} /></Accordion>
        </CardContent>
      </Card>

      <ActionButtons onGenerate={handleGenerateClick} appState={appState} setAppState={updateAppState} isLoading={isGenerating} hasGenerated={hasGenerated} onEpaClick={() => setEpaModalOpen(true)} onProcedureLogClick={() => setProcedureLogModalOpen(true)} onYearlyRotationClick={() => setYearlyRotationModalOpen(true)} onAnalysisClick={() => setAnalysisModalOpen(true)} onOptimizerClick={() => setOptimizerModalOpen(true)} onHandoverClick={() => setHandoverModalOpen(true)} onChatClick={() => setChatModalOpen(true)} onLongTermAnalysisClick={() => setLongTermAnalysisModalOpen(true)} onSurgicalBriefingClick={() => setSurgicalBriefingModalOpen(true)}/>
      
      {isGenerating ? (<div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><div className="flex flex-col items-center gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p>Generating schedules...</p></div></div>) 
      : hasGenerated ? (<ScheduleDisplay appState={appState} setAppState={updateAppState} />) 
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
            return renderFullDashboard(); 
      }
    }
    return renderFullDashboard(); 
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-end mb-4">
            <RoleSwitcher allUsers={ALL_USERS} currentUser={appState.currentUser} onUserSwitch={handleUserSwitch} />
        </div>
        {renderContent()}
        <AboutSection />
      </main>

      <EpaModal isOpen={isEpaModalOpen} onOpenChange={setEpaModalOpen} appState={appState} setAppState={updateAppState} />
      <ProcedureLogModal isOpen={isProcedureLogModalOpen} onOpenChange={setProcedureLogModalOpen} appState={appState} setAppState={updateAppState} />
      <YearlyRotationModal isOpen={isYearlyRotationModalOpen} onOpenChange={setYearlyRotationModalOpen} appState={appState} setAppState={updateAppState} />
      
      {hasGenerated && (
        <>
          <AnalysisModal isOpen={isAnalysisModalOpen} onOpenChange={setAnalysisModalOpen} appState={appState} />
          <HandoverModal isOpen={isHandoverModalOpen} onOpenChange={setHandoverModalOpen} appState={appState} />
          <OptimizerModal isOpen={isOptimizerModalOpen} onOpenChange={setOptimizerModalOpen} appState={appState} setAppState={updateAppState} />
          <ChatModal isOpen={isChatModalOpen} onOpenChange={setChatModalOpen} appState={appState} />
          <LongTermAnalysisModal isOpen={isLongTermAnalysisModalOpen} onOpenChange={setLongTermAnalysisModalOpen} appState={appState} />
          <SurgicalBriefingModal isOpen={isSurgicalBriefingModalOpen} onOpenChange={setSurgicalBriefingModalOpen} appState={appState} />
        </>
      )}
    </div>
  );
}
