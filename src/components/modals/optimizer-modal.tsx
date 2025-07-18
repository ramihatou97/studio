import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { optimizeScheduleAction } from '@/ai/actions';
import type { AppState, Resident } from '@/lib/types';
import { Bot, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { generateSchedules } from '@/lib/schedule-generator';
import { useToast } from '@/hooks/use-toast';

interface OptimizerModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

interface Swap {
    day: number;
    resident1: string;
    resident2: string;
}

interface SwapSuggestion {
    suggestedSwaps: Swap[] | string;
    rationale: string;
}

export function OptimizerModal({ isOpen, onOpenChange, appState, setAppState }: OptimizerModalProps) {
  const [suggestion, setSuggestion] = useState<SwapSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchSuggestion = async () => {
        setIsLoading(true);
        setSuggestion(null);
        const conflictDetails = (appState.errors || []).map(e => e.message).join('\n');
        const result = await optimizeScheduleAction(appState, conflictDetails);
        if (result.success) {
          setSuggestion(result.data);
        } else {
          setSuggestion({ suggestedSwaps: `Error: ${result.error}`, rationale: 'Could not fetch suggestions.' });
        }
        setIsLoading(false);
      };
      fetchSuggestion();
    }
  }, [isOpen, appState]);
  
  const handleApply = () => {
    if (!suggestion || typeof suggestion.suggestedSwaps === 'string') return;

    setAppState(prev => {
        let tempState = { ...prev };
        let newResidents = [...tempState.residents];
        
        suggestion.suggestedSwaps.forEach(swap => {
            const dayIndex = swap.day - 1;
            const res1Index = newResidents.findIndex(r => r.name === swap.resident1);
            const res2Index = newResidents.findIndex(r => r.name === swap.resident2);

            if (res1Index !== -1 && res2Index !== -1 && dayIndex >= 0) {
                const res1Activity = newResidents[res1Index].schedule[dayIndex];
                const res2Activity = newResidents[res2Index].schedule[dayIndex];

                const tempSwapResidents = [...newResidents];
                tempSwapResidents[res1Index] = {
                    ...tempSwapResidents[res1Index],
                    schedule: tempSwapResidents[res1Index].schedule.map((s, i) => i === dayIndex ? res2Activity : s)
                };
                tempSwapResidents[res2Index] = {
                    ...tempSwapResidents[res2Index],
                    schedule: tempSwapResidents[res2Index].schedule.map((s, i) => i === dayIndex ? res1Activity : s)
                };
                newResidents = tempSwapResidents;
            }
        });
        
        // Re-generate the schedule with the swapped residents to re-validate everything
        const updatedStateWithSwaps = { ...tempState, residents: newResidents };
        const finalOutput = generateSchedules(updatedStateWithSwaps);

        return { 
          ...tempState, 
          residents: finalOutput.residents, 
          errors: finalOutput.errors 
        };
    });
    
    toast({ title: "AI Fixes Applied", description: "The schedule has been updated with the AI's suggestions." });
    onOpenChange(false);
  };
  
  const renderSwaps = () => {
    if (!suggestion) return null;
    if (typeof suggestion.suggestedSwaps === 'string') {
        return <p>{suggestion.suggestedSwaps}</p>;
    }
    return (
        <ul className="list-disc pl-5">
            {suggestion.suggestedSwaps.map((swap, index) => (
                <li key={index}>Day {swap.day}: Swap {swap.resident1} with {swap.resident2}</li>
            ))}
        </ul>
    );
  }

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
                      {renderSwaps()}
                    </div>
                     <h3 className="font-semibold pt-4 border-t">Rationale</h3>
                     <div className="prose dark:prose-invert prose-sm max-w-none whitespace-pre-wrap rounded-md border bg-muted p-4">
                      <p>{suggestion.rationale}</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleApply} className="w-full" disabled={typeof suggestion.suggestedSwaps === 'string'}>
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
