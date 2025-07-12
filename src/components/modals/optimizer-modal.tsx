import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { optimizeScheduleAction } from '@/lib/actions';
import type { AppState, ScheduleOutput } from '@/lib/types';
import { Bot, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';

interface OptimizerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  scheduleOutput: ScheduleOutput;
}

interface SwapSuggestion {
    suggestedSwaps: string;
    rationale: string;
}

export function OptimizerModal({ isOpen, onOpenChange, appState, scheduleOutput }: OptimizerModalProps) {
  const [suggestion, setSuggestion] = useState<SwapSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchSuggestion = async () => {
        setIsLoading(true);
        setSuggestion(null);
        const conflictDetails = scheduleOutput.errors.join('\n');
        const result = await optimizeScheduleAction(appState, scheduleOutput, conflictDetails);
        if (result.success) {
          setSuggestion(result.data);
        } else {
          setSuggestion({ suggestedSwaps: `Error: ${result.error}`, rationale: 'Could not fetch suggestions.' });
        }
        setIsLoading(false);
      };
      fetchSuggestion();
    }
  }, [isOpen, appState, scheduleOutput]);
  
  const handleApply = () => {
    // In a real application, you would parse `suggestion.suggestedSwaps`
    // and apply the changes to the `appState`.
    // For this example, we'll just show a toast.
    console.log("Applying fixes...", suggestion);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Schedule Optimizer</DialogTitle>
          <DialogDescription>
            The AI has analyzed the schedule conflicts and proposed changes to resolve them.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48">
              <Bot className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Finding a solution...</p>
            </div>
          ) : suggestion ? (
            <Card>
                <CardHeader>
                    <h3 className="font-semibold">Suggested Swaps</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4">
                      <p>{suggestion.suggestedSwaps}</p>
                    </div>
                     <h3 className="font-semibold pt-4 border-t">Rationale</h3>
                     <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4">
                      <p>{suggestion.rationale}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleApply} className="w-full" disabled={suggestion.suggestedSwaps.startsWith('Error:')}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Accept & Apply Fixes
                    </Button>
                </CardFooter>
            </Card>
          ) : (
            <p>No suggestions available.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
