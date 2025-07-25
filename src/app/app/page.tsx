
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AppState, UserProfile } from '@/lib/types';
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
import { EpaModal } from '@/components/modals/epa-modal';
import { ProcedureLogModal } from '@/components/modals/procedure-log-modal';
import { AnalysisModal } from '@/components/modals/analysis-modal';
import { HandoverModal } from '@/components/modals/handover-modal';
import { OptimizerModal } from '@/components/modals/optimizer-modal';
import { ChatModal } from '@/components/modals/chat-modal';
import { LongTermAnalysisModal } from '@/components/modals/long-term-analysis-modal';
import { SurgicalBriefingModal } from '@/components/modals/surgical-briefing-modal';
import { YearlyRotationModal } from '@/components/modals/yearly-rotation-modal';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, getDoc, writeBatch } from 'firebase/firestore';
import { UserCheck, UserX, GraduationCap, BookUser, CalendarDays, ScrollText, Users, Loader2 } from 'lucide-react';
import type { PendingUser, Resident, Staff } from '@/lib/types';


// This single document will hold the entire shared application state.
const APP_STATE_DOC_ID = "singleton_app_state";

export default function AppPage() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const { toast } = useToast();
  
  const [appState, setAppState] = useState<AppState | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [viewAsUser, setViewAsUser] = useState<UserProfile | null>(null);

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
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  // Effect to load all user profiles and determine the current user's profile
  useEffect(() => {
      if (!user) return;
      const q = query(collection(db, "users"));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const usersData = querySnapshot.docs.map(doc => doc.data() as UserProfile);
          setAllUsers(usersData);
          
          const currentUserProfile = usersData.find(u => u.uid === user.uid);
          if (currentUserProfile) {
              setUserProfile(currentUserProfile);
              if (!viewAsUser) {
                  setViewAsUser(currentUserProfile);
              }
          }
      }, (error) => {
        console.error("Error fetching user profiles:", error);
        toast({ variant: 'destructive', title: 'Permission Error', description: 'Could not fetch user data.' });
      });

      return () => unsubscribe();
  }, [user, toast, viewAsUser]);


  // Effect to subscribe to the main app state from Firestore, depends on viewAsUser
  useEffect(() => {
    if (!viewAsUser) return;

    const appStateRef = doc(db, "appState", APP_STATE_DOC_ID);

    const unsubscribe = onSnapshot(appStateRef, (docSnap) => {
        if (docSnap.exists()) {
            setAppState({
                ...(docSnap.data() as Omit<AppState, 'currentUser'>),
                currentUser: viewAsUser,
            });
        } else {
            console.log("No app state found in Firestore, creating initial state...");
            const initialState = getInitialAppState();
            setDoc(appStateRef, initialState)
                .then(() => {
                    setAppState({ ...initialState, currentUser: viewAsUser });
                    console.log("Initial app state created successfully.");
                })
                .catch(error => {
                    console.error("Error creating initial app state:", error);
                    toast({ variant: 'destructive', title: 'Initialization Error', description: 'Could not create initial app state.' });
                });
        }
    }, (error) => {
        console.error("Error subscribing to app state:", error);
        toast({ variant: 'destructive', title: 'Connection Error', description: 'Could not connect to the database.' });
    });

    return () => unsubscribe();
  }, [toast, viewAsUser]);
  
  useEffect(() => {
    if (appState && viewAsUser && appState.currentUser.uid !== viewAsUser.uid) {
      setAppState(prev => prev ? ({ ...prev, currentUser: viewAsUser }) : null);
    }
  }, [viewAsUser, appState]);


  const updateFirestoreState = async (updates: Partial<AppState>) => {
    if (!appState) return;
    const { currentUser, ...stateToSave } = updates;
    const docRef = doc(db, "appState", APP_STATE_DOC_ID);
    try {
      await updateDoc(docRef, stateToSave);
    } catch (error) {
      console.error("Error updating app state:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: 'Could not save changes to the database.' });
    }
  };


  const handleGenerateClick = () => {
    if (!appState) return;
    setIsGenerating(true);

    setTimeout(() => {
      try {
        const output = generateSchedules(appState);
        
        updateFirestoreState({
          residents: output.residents,
          medicalStudents: output.medicalStudents,
          otherLearners: output.otherLearners,
          errors: output.errors,
        });

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
  
  const handleApproval = async (userToApprove: UserProfile, approve: boolean) => {
    const userRef = doc(db, "users", userToApprove.uid);
    try {
        const batch = writeBatch(db);
        if (approve) {
            batch.update(userRef, { status: 'active' });

            if (userToApprove.role === 'resident') {
                const newResident: Resident = {
                    id: userToApprove.uid, type: 'neuro', name: userToApprove.name, email: userToApprove.email || '', level: userToApprove.pgyLevel || 1, onService: true, isChief: false, chiefOrDays: [], maxOnServiceCalls: 0, offServiceMaxCall: 4, schedule: [], weekendCalls: 0, callDays: [], holidayGroup: 'neither', allowSoloPgy1Call: false, canBeBackup: false, doubleCallDays: 0, orDays: 0,
                };
                 updateFirestoreState({ residents: [...(appState?.residents || []), newResident] });
            } else if (userToApprove.role === 'staff') {
                const newStaff: Staff = {
                    id: userToApprove.uid, name: userToApprove.name, email: userToApprove.email || '', specialtyType: 'other', subspecialty: 'General',
                };
                updateFirestoreState({ staff: [...(appState?.staff || []), newStaff] });
            }
             await batch.commit();
            toast({ title: 'User Approved', description: `${userToApprove.name} has been added and is now active.` });
        } else {
             batch.update(userRef, { status: 'inactive' });
             await batch.commit();
            toast({ variant: 'destructive', title: 'User Denied', description: `${userToApprove.name}'s request has been denied.` });
        }
    } catch (error) {
        console.error("Approval error:", error);
        toast({ variant: 'destructive', title: 'Action Failed', description: 'Could not update user status.'});
    }
  };

  const hasGenerated = appState?.residents.some(r => r.schedule && r.schedule.length > 0) || false;
  
  if (authLoading || !appState || !viewAsUser) {
    return (
        <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin rounded-full h-8 w-8 text-primary"/>
                <p>Loading MediShift...</p>
            </div>
        </div>
    );
  }

  const currentUserRole = viewAsUser.role;

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

        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={updateFirestoreState} /> : (
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
                        <StaffConfig appState={appState} setAppState={updateFirestoreState} />
                        <OrClinicConfig appState={appState} setAppState={updateFirestoreState} />
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
        {showMobileSchedule && (hasGenerated ? <ScheduleDisplay appState={appState} setAppState={updateFirestoreState} /> : (
             <div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><p>Generate schedules to view them here.</p></div>
        ))}
    </div>
  );

  const renderFullDashboard = () => (
    <>
      {currentUserRole === 'program-director' && allUsers.some(u => u.status === 'pending') && (
          <Card className="mb-8 shadow-lg border-amber-500/50">
              <CardHeader><CardTitle>Pending User Approvals</CardTitle><CardDescription>Review and approve or deny new user sign-up requests.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                  {allUsers.filter(u => u.status === 'pending').map(user => (
                      <div key={user.uid} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-muted/50 rounded-lg gap-2">
                          <div><p className="font-semibold">{user.name} <span className="text-sm text-muted-foreground">({user.email})</span></p><p className="text-sm capitalize text-primary font-medium">{user.role} {user.role === 'resident' && `(PGY-${user.pgyLevel})`}</p></div>
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
            <AiPrepopulation setAppState={setAppState as any} appState={appState} />
            <Separator />
            <div className="grid md:grid-cols-2 gap-8"><GeneralSettings appState={appState} setAppState={updateFirestoreState} /><ResidentsConfig appState={appState} setAppState={setAppState as any} /></div>
            <Accordion type="single" collapsible className="w-full space-y-4"><StaffConfig appState={appState} setAppState={updateFirestoreState} /><OrClinicConfig appState={appState} setAppState={updateFirestoreState} /><HolidayCoverage appState={appState} setAppState={updateFirestoreState} /></Accordion>
          </CardContent>
        </Card>
      )}

      <ActionButtons onGenerate={handleGenerateClick} appState={appState} setAppState={setAppState as any} isLoading={isGenerating} hasGenerated={hasGenerated} onEpaClick={() => setEpaModalOpen(true)} onProcedureLogClick={() => setProcedureLogModalOpen(true)} onYearlyRotationClick={() => setYearlyRotationModalOpen(true)} onAnalysisClick={() => setAnalysisModalOpen(true)} onOptimizerClick={() => setOptimizerModalOpen(true)} onHandoverClick={() => setHandoverModalOpen(true)} onChatClick={() => setChatModalOpen(true)} onLongTermAnalysisClick={() => setLongTermAnalysisModalOpen(true)} onSurgicalBriefingClick={() => setSurgicalBriefingModalOpen(true)}/>
      
      {isGenerating ? (<div className="flex items-center justify-center h-48 text-muted-foreground bg-card rounded-2xl shadow-lg mt-8"><div className="flex flex-col items-center gap-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div><p>Generating schedules...</p></div></div>) 
      : hasGenerated ? (<ScheduleDisplay appState={appState} setAppState={setAppState as any} />) 
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
        case 'program-director':
            return renderFullDashboard(); 
        default:
          return renderFullDashboard();
      }
    }
    return renderFullDashboard(); 
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader allUsers={allUsers} currentUser={viewAsUser} setSwitchedUser={setViewAsUser} />
      <main className="container mx-auto p-4 md:p-8">
        {renderContent()}
        <AboutSection />
      </main>

      <EpaModal isOpen={isEpaModalOpen} onOpenChange={setEpaModalOpen} appState={appState} setAppState={setAppState as any} />
      <ProcedureLogModal isOpen={isProcedureLogModalOpen} onOpenChange={setProcedureLogModalOpen} appState={appState} setAppState={setAppState as any} />
      <YearlyRotationModal isOpen={isYearlyRotationModalOpen} onOpenChange={setYearlyRotationModalOpen} appState={appState} setAppState={setAppState as any} />
      
      {hasGenerated && (
        <>
          <AnalysisModal isOpen={isAnalysisModalOpen} onOpenChange={setAnalysisModalOpen} appState={appState} />
          <HandoverModal isOpen={isHandoverModalOpen} onOpenChange={setHandoverModalOpen} appState={appState} />
          <OptimizerModal isOpen={isOptimizerModalOpen} onOpenChange={setOptimizerModalOpen} appState={appState} setAppState={setAppState as any} />
          <ChatModal isOpen={isChatModalOpen} onOpenChange={setChatModalOpen} appState={appState} />
          <LongTermAnalysisModal isOpen={isLongTermAnalysisModalOpen} onOpenChange={setLongTermAnalysisModalOpen} appState={appState} />
          <SurgicalBriefingModal isOpen={isSurgicalBriefingModalOpen} onOpenChange={setSurgicalBriefingModalOpen} appState={appState} />
        </>
      )}
    </div>
  );
}
