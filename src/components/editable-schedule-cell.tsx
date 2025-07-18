import * as React from 'react';
import type { AppState, Resident, PossibleActivity } from '@/lib/types';
import { POSSIBLE_ACTIVITIES } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface EditableScheduleCellProps {
  resident: Resident;
  dayIndex: number;
  setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
  hasError: boolean;
}

export function EditableScheduleCell({ resident, dayIndex, setAppState, hasError }: EditableScheduleCellProps) {
  const activities = resident.schedule[dayIndex];
  // For simplicity, we'll only show and edit the first activity in a cell.
  const primaryActivity = (Array.isArray(activities) && activities.length > 0) ? activities.join(', ') : 'Float';
  
  const id = `${resident.id}-${dayIndex}`;

  const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform } = useDraggable({
    id: id,
    data: { residentId: resident.id, dayIndex },
  });
  
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: id,
    data: { residentId: resident.id, dayIndex },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 10,
  } : undefined;

  const handleActivityChange = (newActivity: PossibleActivity) => {
    setAppState(prev => {
      if (!prev) return null;
      const newResidents = prev.residents.map(r => {
        if (r.id === resident.id) {
          const newSchedule = [...r.schedule];
          // Replace the activity for the specific day.
          newSchedule[dayIndex] = [newActivity];
          return { ...r, schedule: newSchedule };
        }
        return r;
      });
      return { ...prev, residents: newResidents };
    });
  };

  const getCellClass = (activity: string) => {
    if (activity.includes('Call')) return "bg-destructive/80 text-destructive-foreground";
    if (activity.includes('Vacation')) return "bg-gray-400/80 text-background";
    if (activity.includes('OR')) return "bg-primary/80 text-primary-foreground";
    if (activity.includes('Clinic')) return "bg-accent/80 text-accent-foreground";
    if (activity.includes('Post-Call')) return "bg-yellow-500/80 text-yellow-900";
    if (activity.includes('Backup')) return "bg-orange-500/80 text-orange-900";
    if (activity.includes('Pager Holder')) return "bg-sky-500/80 text-sky-900";
    return "bg-secondary text-secondary-foreground";
  };
  
  return (
    <div ref={setDroppableNodeRef} className="h-full w-full">
      <div ref={setDraggableNodeRef} style={style} {...listeners} {...attributes}>
        <Select value={primaryActivity} onValueChange={handleActivityChange}>
          <SelectTrigger className={cn("w-[120px] h-auto p-1.5 text-xs border-0 focus:ring-0 focus:ring-offset-0", getCellClass(primaryActivity), isOver && "ring-2 ring-offset-2 ring-ring", hasError && "ring-2 ring-offset-1 ring-destructive")}>
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {POSSIBLE_ACTIVITIES.map(activity => (
              <SelectItem key={activity} value={activity}>
                {activity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
