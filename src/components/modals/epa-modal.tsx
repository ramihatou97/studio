
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AppState, Evaluation } from '@/lib/types';
import { ALL_EPAS, type EPA } from '@/lib/epa-data';
import { EpaList } from '../epa/epa-list';
import { EpaEvaluationForm } from '../modals/epa-evaluation-form';
import { Button } from '../ui/button';
import { ArrowLeft, Inbox } from 'lucide-react';
import { suggestEpaAction } from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { EpaDashboard } from '../epa/epa-dashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { EpaRequestList } from '../epa/epa-request-list';

interface EpaModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  preselectedResidentId?: string;
  preselectedDayIndex?: number;
  preselectedActivityDescription?: string;
}

export function EpaModal({ 
  isOpen, 
  onOpenChange, 
  appState, 
  setAppState,
  preselectedResidentId, 
  preselectedDayIndex,
  preselectedActivityDescription,
}: EpaModalProps) {
  const [view, setView] = useState<'dashboard' | 'list' | 'form'>('dashboard');
  const [selectedEpa, setSelectedEpa] = useState<EPA | null>(null);
  const [activeEvaluation, setActiveEvaluation] = useState<Evaluation | null>(null);
  const [isSuggesting, setIsSuggesting] = useState(false);
  
  const { currentUser } = appState;
  const { toast } = useToast();

  const activityContext = useMemo(() => {
    if (!preselectedResidentId || preselectedDayIndex === undefined) {
      return { residentId: '', activityDate: '', activityDescription: preselectedActivityDescription || '' };
    }
    const resident = appState.residents.find(r => r.id === preselectedResidentId);
    if (!resident) return { residentId: '', activityDate: '', activityDescription: '' };

    const activityDate = new Date(appState.general.startDate);
    activityDate.setDate(activityDate.getDate() + preselectedDayIndex);

    let description = preselectedActivityDescription || resident.schedule[preselectedDayIndex]?.join(', ') || '';
    if (description.includes('OR')) {
        const cases = appState.orCases[preselectedDayIndex] || [];
        if (cases.length > 0) {
            description = cases[0].procedure;
        }
    }
    return {
      residentId: preselectedResidentId,
      activityDate: activityDate.toISOString().split('T')[0],
      activityDescription: description,
    };
  }, [preselectedResidentId, preselectedDayIndex, preselectedActivityDescription, appState]);


  useEffect(() => {
    const suggestAndCreateEvaluation = async () => {
      if (isOpen && activityContext.activityDescription && view !== 'form') {
        setIsSuggesting(true);
        const result = await suggestEpaAction(activityContext.activityDescription);
        let foundEpa: EPA | null = null;
        if (result.success && result.data) {
          foundEpa = ALL_EPAS.find(e => e.id === result.data.suggestedEpaId) || null;
          if (foundEpa) {
            toast({
              title: "AI Suggestion",
              description: `Based on "${activityContext.activityDescription}", we suggest: ${foundEpa.id}.`,
            });
          }
        }
        if (!foundEpa) {
            toast({ variant: 'destructive', title: "AI Suggestion Failed", description: "Could not automatically suggest an EPA." });
        }
        setIsSuggesting(false);
        if(foundEpa) {
            handleSelectEpa(foundEpa);
        }
      }
    };
    suggestAndCreateEvaluation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activityContext.activityDescription]);


  const handleSelectEpa = (epa: EPA) => {
    const newEvaluation: Evaluation = {
        id: uuidv4(),
        epaId: epa.id,
        residentId: activityContext.residentId || (currentUser.role === 'resident' ? currentUser.id : ''),
        evaluatorId: currentUser.role === 'staff' ? currentUser.id : '',
        status: 'draft',
        activityDescription: activityContext.activityDescription,
        activityDate: activityContext.activityDate,
        evaluationDate: null,
        milestoneRatings: {},
        overallRating: 0,
        feedback: '',
    };
    setActiveEvaluation(newEvaluation);
    setSelectedEpa(epa);
    setView('form');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView('dashboard');
      setSelectedEpa(null);
      setActiveEvaluation(null);
    }
    onOpenChange(open);
  };
  
  const handleEditEvaluation = (evaluation: Evaluation) => {
      const epa = ALL_EPAS.find(e => e.id === evaluation.epaId);
      if (epa) {
          setSelectedEpa(epa);
          setActiveEvaluation(evaluation);
          setView('form');
      }
  };

  const getTitle = () => {
      switch(view) {
          case 'dashboard': return "EPA Dashboard & Requests";
          case 'list': return "Select an EPA to Evaluate";
          case 'form': 
            if (!selectedEpa) return "EPA Evaluation";
            if (currentUser.role === 'resident') return `Request: ${selectedEpa.title}`;
            return `Evaluate: ${selectedEpa.title}`;
          default: return "EPA Management";
      }
  }

  const getDescription = () => {
    switch(view) {
        case 'dashboard': return "View your progress, statistics, and pending evaluation requests.";
        case 'list': return "Browse all Entrustable Professional Activities.";
        case 'form':
          if (currentUser.role === 'resident') return "Select supervising staff and export a PDF request for this evaluation.";
          return "Fill out the evaluation form for the selected resident and activity.";
        default: return "Manage EPA evaluations.";
    }
  }
  
  const hasGenerated = appState.residents.some(r => r.schedule.length > 0);

  const pendingRequests = appState.evaluations.filter(e => e.status === 'pending' && (currentUser.role === 'program-director' || e.evaluatorId === currentUser.id));

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          {view === 'form' ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => setView('dashboard')}>
                <ArrowLeft className="h-4 w-4"/>
              </Button>
              <div>
                <DialogTitle>{getTitle()}</DialogTitle>
                <DialogDescription>{getDescription()}</DialogDescription>
              </div>
            </div>
          ) : (
             <div>
                <DialogTitle>{getTitle()}</DialogTitle>
                <DialogDescription>{getDescription()}</DialogDescription>
            </div>
          )}
        </DialogHeader>
        
        {view === 'dashboard' ? (
           <Tabs defaultValue="dashboard" className="flex-1 overflow-hidden flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dashboard">My Dashboard</TabsTrigger>
                <TabsTrigger value="requests" className="relative">
                  Requests
                  {pendingRequests.length > 0 && <span className="absolute top-0 right-2 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">{pendingRequests.length}</span>}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="dashboard" className="flex-1 overflow-y-auto mt-2">
                 <EpaDashboard appState={appState} setAppState={setAppState as any} onNewRequest={() => setView('list')} />
              </TabsContent>
              <TabsContent value="requests" className="flex-1 overflow-y-auto mt-2">
                {pendingRequests.length > 0 ? (
                  <EpaRequestList evaluations={pendingRequests} appState={appState} onEvaluate={handleEditEvaluation} />
                ) : (
                   <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center">
                    <Inbox className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-semibold">All Caught Up!</h3>
                    <p>There are no pending evaluation requests for you.</p>
                  </div>
                )}
              </TabsContent>
           </Tabs>
        ) : view === 'list' ? (
            <EpaList 
                epas={ALL_EPAS} 
                onSelectEpa={handleSelectEpa} 
                currentUserRole={currentUser.role} 
                isLoading={isSuggesting} 
            />
        ) : (
            activeEvaluation && selectedEpa && (
                <EpaEvaluationForm
                  key={activeEvaluation.id}
                  evaluation={activeEvaluation}
                  epa={selectedEpa}
                  appState={appState}
                  setAppState={setAppState as any}
                  onComplete={() => setView('dashboard')}
                />
            )
        )}
      </DialogContent>
    </Dialog>
  );
}
