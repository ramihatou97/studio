
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AppState } from '@/lib/types';
import { ALL_EPAS, type EPA } from '@/lib/epa-data';
import { EpaList } from '../epa/epa-list';
import { EpaEvaluationForm } from '../epa/epa-evaluation-form';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { suggestEpaAction } from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';

interface EpaModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  preselectedResidentId?: string;
  preselectedDayIndex?: number;
}

export function EpaModal({ 
  isOpen, 
  onOpenChange, 
  appState, 
  preselectedResidentId, 
  preselectedDayIndex 
}: EpaModalProps) {
  const [selectedEpa, setSelectedEpa] = useState<EPA | null>(null);
  const { currentUser } = appState;
  const { toast } = useToast();
  const hasGenerated = Object.values(appState.residents).some(r => r.schedule && r.schedule.length > 0);
  
  const [activityDescription, setActivityDescription] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    if (isOpen && preselectedResidentId !== undefined && preselectedDayIndex !== undefined) {
      // Logic to find activity description
      const resident = appState.residents.find(r => r.id === preselectedResidentId);
      if (resident) {
        let description = resident.schedule[preselectedDayIndex]?.join(', ') || '';
        
        // If it's an OR day, get more specific case info
        if (description.includes('OR')) {
            const cases = appState.orCases[preselectedDayIndex] || [];
            if (cases.length > 0) {
                // For simplicity, using the first case. A real app might let the user choose.
                description = cases[0].procedure;
            }
        }
        setActivityDescription(description);
      }
    }
  }, [isOpen, preselectedResidentId, preselectedDayIndex, appState]);


  useEffect(() => {
    const suggestEpa = async () => {
      if (activityDescription && !selectedEpa) {
        setIsSuggesting(true);
        const result = await suggestEpaAction(activityDescription);
        if (result.success && result.data) {
          const foundEpa = ALL_EPAS.find(e => e.id === result.data.suggestedEpaId);
          if (foundEpa) {
            setSelectedEpa(foundEpa);
            toast({
              title: "AI Suggestion",
              description: `Based on "${activityDescription}", we suggest evaluating: ${foundEpa.id}.`,
            });
          }
        } else {
            toast({
                variant: 'destructive',
                title: "AI Suggestion Failed",
                description: "Could not automatically suggest an EPA.",
            });
        }
        setIsSuggesting(false);
      }
    };
    if (isOpen && activityDescription) {
        suggestEpa();
    }
  }, [isOpen, activityDescription, selectedEpa, toast]);


  const handleSelectEpa = (epa: EPA) => {
    setSelectedEpa(epa);
  };

  const handleBackToList = () => {
    setSelectedEpa(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedEpa(null);
      setActivityDescription('');
    }
    onOpenChange(open);
  }

  const getTitle = () => {
    if (!selectedEpa) return "EPA Evaluation Management";
    if (currentUser.role === 'resident') return `EPA Evaluation Request: ${selectedEpa.title}`;
    return `EPA Evaluation: ${selectedEpa.title}`;
  }

  const getDescription = () => {
    if (!selectedEpa) return "Browse all Entrustable Professional Activities or select one to start an evaluation.";
    if (currentUser.role === 'resident') return "Select the relevant activity and use the export button to send this form to your staff for completion.";
    return "Fill out the evaluation form for the selected resident and activity.";
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        <DialogHeader>
          {selectedEpa ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={handleBackToList}>
                <ArrowLeft className="h-4 w-4"/>
              </Button>
              <div>
                <DialogTitle>{getTitle()}</DialogTitle>
                <DialogDescription>
                  {getDescription()}
                </DialogDescription>
              </div>
            </div>
          ) : (
             <div>
                <DialogTitle>{getTitle()}</DialogTitle>
                <DialogDescription>
                  {isSuggesting ? 'AI is suggesting an EPA for your selected activity...' : getDescription()}
                </DialogDescription>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {selectedEpa ? (
            <EpaEvaluationForm
              epa={selectedEpa}
              appState={appState}
              onBack={handleBackToList}
              hasGenerated={hasGenerated}
              prefilledResidentId={preselectedResidentId}
              prefilledActivityDescription={activityDescription}
            />
          ) : (
            <EpaList epas={ALL_EPAS} onSelectEpa={handleSelectEpa} currentUserRole={currentUser.role} isLoading={isSuggesting} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
