
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { AppState } from '@/lib/types';
import { ALL_EPAS, type EPA } from '@/lib/epa-data';
import { EpaList } from '../epa/epa-list';
import { EpaEvaluationForm } from '../epa/epa-evaluation-form';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

interface EpaModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

export function EpaModal({ isOpen, onOpenChange, appState }: EpaModalProps) {
  const [selectedEpa, setSelectedEpa] = useState<EPA | null>(null);
  const { currentUser } = appState;

  const handleSelectEpa = (epa: EPA) => {
    setSelectedEpa(epa);
  };

  const handleBackToList = () => {
    setSelectedEpa(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedEpa(null);
    }
    onOpenChange(open);
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
                <DialogTitle>EPA Evaluation: {selectedEpa.title}</DialogTitle>
                <DialogDescription>
                  Fill out the evaluation form for the selected resident and activity.
                </DialogDescription>
              </div>
            </div>
          ) : (
             <div>
                <DialogTitle>EPA Evaluation Management</DialogTitle>
                <DialogDescription>
                  Browse all Entrustable Professional Activities or select one to start an evaluation.
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
            />
          ) : (
            <EpaList epas={ALL_EPAS} onSelectEpa={handleSelectEpa} currentUserRole={currentUser.role} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
