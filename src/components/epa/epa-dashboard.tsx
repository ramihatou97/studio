
"use client";

import type { AppState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useMemo } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ALL_EPAS } from '@/lib/epa-data';


interface EpaDashboardProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onNewRequest: () => void;
}

export function EpaDashboard({ appState, setAppState, onNewRequest }: EpaDashboardProps) {
  const { currentUser, evaluations } = appState;
  
  const relevantEvaluations = useMemo(() => {
    return (evaluations || []).filter(e => {
        if (currentUser.role === 'program-director') return true;
        if (currentUser.role === 'resident') return e.residentId === currentUser.id;
        if (currentUser.role === 'staff') return e.evaluatorId === currentUser.id;
        return false;
    });
  }, [evaluations, currentUser]);
  
  const completedEvaluations = useMemo(() => {
    return relevantEvaluations.filter(e => e.status === 'completed');
  }, [relevantEvaluations]);

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


  return (
    <div className="space-y-6 p-1">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My EPA Dashboard</CardTitle>
              <CardDescription>
                {currentUser.role === 'resident'
                  ? 'Track your progress and request new evaluations.'
                  : 'View evaluation statistics.'
                }
              </CardDescription>
            </div>
            {currentUser.role === 'resident' && (
              <Button onClick={onNewRequest}><PlusCircle className="mr-2 h-4 w-4"/> New Evaluation Request</Button>
            )}
        </CardHeader>
         <CardContent>
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
                        <h4 className="font-semibold mb-2">Key Stats</h4>
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
                <p className="text-muted-foreground text-center py-8">No completed evaluations to display yet.</p>
            )}
         </CardContent>
      </Card>
      
    </div>
  );
}
