
"use client";

import type { Evaluation, AppState } from '@/lib/types';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { ALL_EPAS } from '@/lib/epa-data';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Calendar, User, Edit } from 'lucide-react';

interface EpaRequestListProps {
  evaluations: Evaluation[];
  appState: AppState;
  onEvaluate: (evaluation: Evaluation) => void;
}

export function EpaRequestList({ evaluations, appState, onEvaluate }: EpaRequestListProps) {
  const { residents, general } = appState;
  const today = new Date();
  
  const sortedEvaluations = [...evaluations].sort((a,b) => new Date(a.activityDate).getTime() - new Date(b.activityDate).getTime());

  return (
    <div className="space-y-4 p-1">
      {sortedEvaluations.map(ev => {
        const epa = ALL_EPAS.find(e => e.id === ev.epaId);
        const resident = residents.find(r => r.id === ev.residentId);
        const activityDate = new Date(ev.activityDate);
        const daysSinceActivity = Math.round((today.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysSinceActivity > (general.reminderFrequency || 3);
        
        return (
          <Card key={ev.id} className={isOverdue ? 'border-destructive' : ''}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{epa?.title}</CardTitle>
                <CardDescription className="font-medium text-primary mt-1">{epa?.id}</CardDescription>
              </div>
              <Button onClick={() => onEvaluate(ev)}><Edit className="mr-2 h-4 w-4"/> Complete Evaluation</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">Resident:</span> {resident?.name} (PGY-{resident?.level})
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                        <span className="font-semibold">Activity:</span> {ev.activityDescription} on {ev.activityDate}
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <AlertCircle className={`h-4 w-4 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`} />
                    <div>
                        <span className="font-semibold">Status:</span> Pending ({formatDistanceToNow(activityDate, { addSuffix: true })})
                    </div>
                </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}
