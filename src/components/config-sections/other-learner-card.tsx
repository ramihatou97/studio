import type { OtherLearner } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { Textarea } from "../ui/textarea";

interface OtherLearnerCardProps {
  learner: OtherLearner;
  updateLearner: (id: string, updatedLearner: Partial<OtherLearner>) => void;
  removeLearner: (id: string) => void;
}

export function OtherLearnerCard({ learner, updateLearner, removeLearner }: OtherLearnerCardProps) {
  return (
    <div className="other-learner-entry flex flex-col space-y-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center space-x-3">
        <Input placeholder="Name" value={learner.name} onChange={(e) => updateLearner(learner.id, { name: e.target.value })} className="w-1/2" />
        <Input placeholder="Role (e.g., PA Student)" value={learner.role} onChange={(e) => updateLearner(learner.id, { role: e.target.value })} className="w-1/2" />
        <Button variant="ghost" size="icon" onClick={() => removeLearner(learner.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Label>Manual Schedule</Label>
        <Textarea 
            placeholder="Enter full schedule text here..." 
            className="mt-1" 
            rows={2}
            value={learner.scheduleText}
            onChange={(e) => updateLearner(learner.id, { scheduleText: e.target.value })}
        />
      </div>
    </div>
  );
}
