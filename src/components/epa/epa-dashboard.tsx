
"use client";

import type { AppState, Evaluation, Resident } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bot, Loader2, PlusCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ALL_EPAS } from '@/lib/epa-data';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { analyzeEpaPerformanceAction } from '@/ai/actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

interface EpaDashboardProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onNewRequest: () => void;
}

interface AnalysisResult {
    qualitativeAnalysis: string;
    suggestedFocusEpaId?: string;
}

export function EpaDashboard({ appState, setAppState, onNewRequest }: EpaDashboardProps) {
  const { currentUser, evaluations, general, residents } = appState;
  const { toast } = useToast();
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const relevantEvaluations = useMemo(() => {
    const residentToAnalyze = selectedResidentId || (currentUser.role === 'resident' ? currentUser.id : '');
    if (!residentToAnalyze) return [];
    
    return (evaluations || []).filter(e => e.residentId === residentToAnalyze);
  }, [evaluations, currentUser, selectedResidentId]);
  
  const completedEvaluations = useMemo(() => {
    return relevantEvaluations.filter(e => e.status === 'completed');
  }, [relevantEvaluations]);
  
  const selectedResident = useMemo(() => {
      const residentId = selectedResidentId || (currentUser.role === 'resident' ? currentUser.id : '');
      return residents.find(r => r.id === residentId);
  }, [selectedResidentId, currentUser, residents]);

  const chartData = useMemo(() => {
    if (completedEvaluations.length === 0) return [];
    
    const dataByStage: Record<string, { total: number, count: number, name: string }> = {
      'Foundations': { total: 0, count: 0, name: 'Foundations' },
      'Core': { total: 0, count: 0, name: 'Core' },
      'Transition to Practice': { total: 0, count: 0, name: 'TTP' },
    };

    completedEvaluations.forEach(ev => {
      const epa = ALL_EPAS.find(e => e.id === ev.epaId);
      if (epa && epa.stage !== 'Transition to Discipline') {
         const stage = epa.stage === 'Transition to Practice' ? 'TTP' : epa.stage;
         dataByStage[stage].total += ev.overallRating;
         dataByStage[stage].count++;
      }
    });

    return Object.values(dataByStage).map(d => ({
      name: d.name,
      avgRating: d.count > 0 ? d.total / d.count : 0,
    }));
  }, [completedEvaluations]);

  const handleGeneralChange = (field: string, value: any) => {
    setAppState(prev => prev ? ({ ...prev, general: { ...prev.general, [field]: value } }) : null);
  };
  
  const handleRunAnalysis = async () => {
      if (!selectedResident) {
          toast({ variant: 'destructive', title: 'Please select a resident to analyze.' });
          return;
      }
       if (completedEvaluations.length < 3) {
          toast({ variant: 'destructive', title: 'Insufficient Data', description: 'At least 3 completed evaluations are needed for a meaningful analysis.' });
          return;
      }
      setIsAnalyzing(true);
      setAnalysisResult(null);
      const result = await analyzeEpaPerformanceAction(selectedResident.name, completedEvaluations);
      if (result.success && result.data) {
          setAnalysisResult(result.data);
      } else {
          toast({ variant: 'destructive', title: 'Analysis Failed', description: result.error });
      }
      setIsAnalyzing(false);
  }

  const renderDashboardContent = () => (
    <>
        {completedEvaluations.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <h4 className="font-semibold mb-2 text-center">Average Entrustment by Stage</h4>
                     <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="avgRating" fill="var(--color-chart-1)" name="Avg Rating" />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div>
                    <h4 className="font-semibold mb-2">Key Stats for {selectedResident?.name || 'You'}</h4>
                    <div className="space-y-3">
                         <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                            <span className="font-medium">Total Completed Evaluations</span>
                            <span className="font-bold text-2xl text-primary">{completedEvaluations.length}</span>
                         </div>
                         <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
                            <span className="font-medium">Pending Requests Sent</span>
                            <span className="font-bold text-2xl text-primary">{relevantEvaluations.filter(e => e.status === 'pending').length}</span>
                         </div>
                    </div>
                </div>
            </div>
        ) : (
            <p className="text-muted-foreground text-center py-8">No completed evaluations to display yet for {selectedResident?.name || 'this resident'}.</p>
        )}
         {analysisResult && (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Bot /> AI Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: analysisResult.qualitativeAnalysis.replace(/\n/g, '<br />')}} />
                    {analysisResult.suggestedFocusEpaId && (
                        <Alert className="mt-4">
                            <AlertTitle className="font-semibold">Suggested Focus Area</AlertTitle>
                            <AlertDescription>
                                Based on the analysis, the AI recommends focusing on: <span className="font-bold">{analysisResult.suggestedFocusEpaId}</span>
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        )}
    </>
  );

  return (
    <div className="space-y-6 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My EPA Dashboard</CardTitle>
              <CardDescription>
                {currentUser.role === 'resident'
                  ? 'Track your progress and request new evaluations.'
                  : 'View evaluation statistics and settings.'
                }
              </CardDescription>
            </div>
            {currentUser.role === 'resident' && (
              <Button onClick={onNewRequest}><PlusCircle className="mr-2 h-4 w-4"/> New Evaluation Request</Button>
            )}
             {currentUser.role === 'program-director' && (
                <div className="w-1/3">
                    <Label htmlFor="reminder-frequency">Reminder Frequency (days)</Label>
                    <div className="flex items-center gap-4 pt-2">
                        <Slider
                            id="reminder-frequency"
                            min={1}
                            max={7}
                            step={1}
                            value={[general.reminderFrequency || 3]}
                            onValueChange={(value) => handleGeneralChange('reminderFrequency', value[0])}
                        />
                        <span className="font-bold text-lg w-12 text-center">{general.reminderFrequency}</span>
                    </div>
                </div>
            )}
        </CardHeader>
         <CardContent>
            {currentUser.role !== 'resident' && (
                <div className="p-4 border rounded-lg bg-muted/50 mb-6">
                    <Label>Analyze Resident Performance</Label>
                    <div className="flex gap-2 mt-2">
                        <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
                            <SelectTrigger><SelectValue placeholder="Select a resident..." /></SelectTrigger>
                            <SelectContent>
                                {residents.filter(r => r.type === 'neuro').map(r => (
                                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={handleRunAnalysis} disabled={isAnalyzing || !selectedResidentId}>
                            {isAnalyzing ? <Loader2 className="animate-spin" /> : <Bot />}
                            Analyze
                        </Button>
                    </div>
                </div>
            )}
            
            {isAnalyzing ? (
                 <div className="flex flex-col items-center justify-center h-48">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">AI is analyzing performance data...</p>
                </div>
            ) : (
                renderDashboardContent()
            )}
         </CardContent>
      </Card>
      
    </div>
  );
}
