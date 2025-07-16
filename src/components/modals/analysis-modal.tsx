import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { analyzeScheduleConflictsAction } from '@/lib/actions';
import type { AppState } from '@/lib/types';
import { Bot } from 'lucide-react';

interface AnalysisModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

export function AnalysisModal({ isOpen, onOpenChange, appState }: AnalysisModalProps) {
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAnalysis = async () => {
        setIsLoading(true);
        setAnalysisResult(null);
        const result = await analyzeScheduleConflictsAction(appState);
        if (result.success) {
          setAnalysisResult(result.data);
        } else {
          setAnalysisResult(`Error: ${result.error}`);
        }
        setIsLoading(false);
      };
      fetchAnalysis();
    }
  }, [isOpen, appState]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Schedule Analysis</DialogTitle>
          <DialogDescription>
            The AI has analyzed the generated schedule for potential conflicts and rule violations.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Bot className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Analyzing schedule...</p>
            </div>
          ) : (
            <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4">
              <p>{analysisResult || 'No analysis available.'}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
