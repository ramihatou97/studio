import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { analyzeResidentPerformanceAction, generateHistoricalDataAction } from '@/lib/actions';
import type { AppState } from '@/lib/types';
import type { AnalyzeResidentPerformanceOutput } from '@/ai/flows/analyze-resident-performance';
import { Bot, LineChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AnalysisResultsDisplay } from '../analysis-results-display';

interface LongTermAnalysisModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

export function LongTermAnalysisModal({ isOpen, onOpenChange, appState }: LongTermAnalysisModalProps) {
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResidentPerformanceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const { toast } = useToast();

  const handleRunAnalysis = async () => {
    if (!selectedResidentId) {
      toast({ variant: 'destructive', title: 'Please select a resident.' });
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    const resident = appState.residents.find(r => r.id === selectedResidentId);
    if (!resident) {
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Generate simulated historical data
      setLoadingMessage('Simulating historical data...');
      const historicalDataResult = await generateHistoricalDataAction({
        residentName: resident.name,
        pgyLevel: resident.level,
        startDate,
        endDate,
      });

      if (!historicalDataResult.success || !historicalDataResult.data) {
        throw new Error(historicalDataResult.error || 'Failed to simulate data.');
      }
      
      // Step 2: Run analysis on the generated data
      setLoadingMessage('Analyzing performance...');
      const analysisRequestPrompt = `Analyze case volume, diversity, and overall progression for ${resident.name} (PGY-${resident.level}) from ${startDate} to ${endDate}. Provide recommendations for the next period.`;
      
      const performanceResult = await analyzeResidentPerformanceAction({
        historicalData: JSON.stringify(historicalDataResult.data, null, 2),
        analysisPrompt: analysisRequestPrompt,
      });

      if (!performanceResult.success || !performanceResult.data) {
        throw new Error(performanceResult.error || 'Failed to analyze performance.');
      }
      
      setAnalysisResult(performanceResult.data);

    } catch (error) {
      const err = error as Error;
      toast({ variant: 'destructive', title: 'Analysis Failed', description: err.message });
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Long-Term Resident Performance Analysis</DialogTitle>
          <DialogDescription>
            Select a resident and a time frame to generate and analyze their historical performance data.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-4 gap-4 p-4 border rounded-lg">
          <div>
            <Label>Resident</Label>
            <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
              <SelectTrigger><SelectValue placeholder="Select a resident..." /></SelectTrigger>
              <SelectContent>
                {appState.residents.filter(r => r.type === 'neuro').map(r => (
                  <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
           <div>
            <Label>Start Date</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label>End Date</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div className="self-end">
            <Button onClick={handleRunAnalysis} disabled={isLoading} className="w-full">
              {isLoading ? 'Analyzing...' : <><LineChart className="mr-2 h-4 w-4" /> Run Analysis</>}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto mt-4 p-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Bot className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">{loadingMessage || 'Initializing...'}</p>
            </div>
          ) : analysisResult ? (
            <AnalysisResultsDisplay result={analysisResult} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                <LineChart className="h-16 w-16 mb-4" />
                <h3 className="text-lg font-semibold">Ready for Analysis</h3>
                <p>Configure your analysis options above and click "Run Analysis".</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
