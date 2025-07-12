import type { MedicalStudent } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface MedicalStudentCardProps {
  student: MedicalStudent;
  updateStudent: (id: string, updatedStudent: Partial<MedicalStudent>) => void;
  removeStudent: (id: string) => void;
}

export function MedicalStudentCard({ student, updateStudent, removeStudent }: MedicalStudentCardProps) {
  return (
    <div className="student-entry flex flex-col space-y-2 bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700">
      <div className="flex items-center space-x-3">
        <Input placeholder="Name" value={student.name} onChange={(e) => updateStudent(student.id, { name: e.target.value })} className="w-2/5" />
        <Input placeholder="Level (e.g., MS3)" value={student.level} onChange={(e) => updateStudent(student.id, { level: e.target.value })} className="w-1/4" />
        <Input placeholder="Preceptor" value={student.preceptor} onChange={(e) => updateStudent(student.id, { preceptor: e.target.value })} className="w-1/3" />
        <Button variant="ghost" size="icon" onClick={() => removeStudent(student.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div>
        <Label>Weeks on Service (e.g., 1,2)</Label>
        <Input 
            type="text" 
            placeholder="Weeks" 
            className="mt-1" 
            value={student.weeks.join(', ')} 
            onChange={(e) => updateStudent(student.id, { weeks: e.target.value.split(',').map(w => parseInt(w.trim())).filter(w => !isNaN(w)) })}
        />
      </div>
      <div>
        <Label>Manual On-Call (day #)</Label>
        <Input 
            type="text" 
            placeholder="e.g., 5, 12, 19" 
            className="mt-1" 
            value={student.calls.join(', ')} 
            onChange={(e) => updateStudent(student.id, { calls: e.target.value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)) })}
        />
      </div>
    </div>
  );
}
