import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateSurgicalBriefingAction } from '@/ai/actions';
import type { AppState, OrCase } from '@/lib/types';
import { Bot, BrainCircuit, ClipboardCopy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface SurgicalBriefingModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

export function SurgicalBriefingModal({ isOpen, onOpenChange, appState }: SurgicalBriefingModalProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [briefing, setBriefing] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const allCases = useMemo(() => {
    const cases: (OrCase & { id: string, day: number, date: string })[] = [];
    Object.entries(appState.orCases).forEach(([dayIndexStr, casesForDay]) => {
      const dayIndex = parseInt(dayIndexStr, 10);
      const dayDate = new Date(appState.general.startDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);

      casesForDay.forEach((caseItem, caseIndex) => {
        cases.push({
          ...caseItem,
          id: `${dayIndex}-${caseIndex}`,
          day: dayIndex + 1,
          date: dayDate.toISOString().split('T')[0],
        });
      });
    });
    return cases.sort((a,b) => a.day - b.day);
  }, [appState.orCases, appState.general.startDate]);

  const handleGenerateBriefing = async () => {
    if (!selectedCaseId) {
      toast({ variant: 'destructive', title: 'Please select a case.' });
      return;
    }
    
    const selectedCase = allCases.find(c => c.id === selectedCaseId);
    if (!selectedCase) return;

    setIsLoading(true);
    setBriefing(null);
    
    try {
      const result = await generateSurgicalBriefingAction({
        diagnosis: selectedCase.diagnosis,
        procedure: selectedCase.procedure,
        patientDetails: `The patient is a ${selectedCase.age}-year-old ${selectedCase.patientSex}.`,
      });

      if (result.success && result.data) {
        setBriefing(result.data);
      } else {
        throw new Error(result.error || 'Failed to generate briefing.');
      }
    } catch (error) {
      const err = error as Error;
      toast({ variant: 'destructive', title: 'Briefing Failed', description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (briefing) {
      navigator.clipboard.writeText(briefing);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Surgical Briefing</DialogTitle>
          <DialogDescription>
            Select a scheduled OR case to generate a detailed surgical plan and educational summary for resident preparation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-end gap-2 p-4 border rounded-lg">
          <div className="flex-1">
            <label className="text-sm font-medium">Scheduled Case</label>
            <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
              <SelectTrigger><SelectValue placeholder="Select a case to prepare for..." /></SelectTrigger>
              <SelectContent>
                {allCases.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    Day {c.day} ({c.date}): {c.procedure} with {c.surgeon}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateBriefing} disabled={isLoading || !selectedCaseId}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            Generate Briefing
          </Button>
        </div>

        <ScrollArea className="flex-1 mt-4 border rounded-lg p-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Bot className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">AI is preparing the surgical plan...</p>
            </div>
          ) : briefing ? (
            <div className="relative p-4">
               <Button onClick={handleCopy} size="sm" variant="outline" className="absolute top-4 right-4 gap-2">
                    <ClipboardCopy className="w-4 h-4" /> Copy
                </Button>
                <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: briefing.replace(/\n/g, '<br />') }}
                />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                <BrainCircuit className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Ready to Prepare</h3>
                <p>Select a case and click "Generate Briefing" to begin.</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
