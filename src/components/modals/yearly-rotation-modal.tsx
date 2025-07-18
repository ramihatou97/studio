
"use client";

import { useState, useMemo } from 'react';
import type { AppState, OffServiceRotation, OffServiceRequest } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2, CalendarDays, Bot, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateYearlyRotationScheduleAction } from '@/ai/actions';
import { v4 as uuidv4 } from 'uuid';
import { cn } from '@/lib/utils';

interface YearlyRotationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function YearlyRotationModal({ isOpen, onOpenChange, appState, setAppState }: YearlyRotationModalProps) {
  const [newRotationName, setNewRotationName] = useState('');
  const [newRequest, setNewRequest] = useState<Partial<OffServiceRequest>>({});
  const [generatedSchedule, setGeneratedSchedule] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const neuroResidents = useMemo(() => appState.residents.filter(r => r.type === 'neuro'), [appState.residents]);
  const offServiceRotations = useMemo(() => appState.offServiceRotations || [], [appState.offServiceRotations]);
  const offServiceRequests = useMemo(() => appState.offServiceRequests || [], [appState.offServiceRequests]);

  const handleAddRotationType = () => {
    if (!newRotationName.trim()) return;
    const newRotation: OffServiceRotation = {
      id: uuidv4(),
      name: newRotationName.trim(),
    };
    setAppState(prev => ({
      ...prev,
      offServiceRotations: [...(prev.offServiceRotations || []), newRotation],
    }));
    setNewRotationName('');
  };

  const handleRemoveRotationType = (id: string) => {
    setAppState(prev => ({
      ...prev,
      offServiceRotations: (prev.offServiceRotations || []).filter(r => r.id !== id),
      offServiceRequests: (prev.offServiceRequests || []).filter(req => req.rotationId !== id),
    }));
  };

  const handleAddRequest = () => {
    if (!newRequest.residentId || !newRequest.rotationId || !newRequest.durationInBlocks) return;
    const fullRequest: OffServiceRequest = {
      id: uuidv4(),
      residentId: newRequest.residentId,
      rotationId: newRequest.rotationId,
      durationInBlocks: newRequest.durationInBlocks,
      timingPreference: newRequest.timingPreference || 'any',
    };
    setAppState(prev => ({
      ...prev,
      offServiceRequests: [...(prev.offServiceRequests || []), fullRequest],
    }));
    setNewRequest({});
  };

  const handleRemoveRequest = (id: string) => {
    setAppState(prev => ({
      ...prev,
      offServiceRequests: (prev.offServiceRequests || []).filter(req => req.id !== id),
    }));
  };
  
  const handleGenerateSchedule = async () => {
    setIsLoading(true);
    setGeneratedSchedule(null);
    try {
        const residentsInfo = neuroResidents.map(r => ({ id: r.id, name: r.name, pgyLevel: r.level }));
        const requests = offServiceRequests.map(req => {
            const rotation = offServiceRotations.find(r => r.id === req.rotationId);
            return {
                residentId: req.residentId,
                rotationName: rotation?.name || 'Unknown Rotation',
                durationInBlocks: req.durationInBlocks,
                timingPreference: req.timingPreference,
            };
        });

        const result = await generateYearlyRotationScheduleAction({ residents: residentsInfo, offServiceRequests: requests });
        if (result.success && result.data) {
            setGeneratedSchedule(result.data);
            toast({ title: 'Yearly Schedule Generated', description: 'The AI has created the optimized rotation schedule.' });
        } else {
            throw new Error(result.error || 'Failed to generate schedule.');
        }

    } catch (error) {
        toast({ variant: 'destructive', title: 'Generation Failed', description: (error as Error).message });
    } finally {
        setIsLoading(false);
    }
  };
  
  const getRotationName = (rotationId: string) => offServiceRotations.find(r => r.id === rotationId)?.name || '...';
  const getResidentName = (residentId: string) => neuroResidents.find(r => r.id === residentId)?.name || '...';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarDays /> Yearly Rotation Planner</DialogTitle>
          <DialogDescription>
            Configure off-service rotations and use AI to generate an optimized, balanced yearly schedule for all neurosurgery residents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-3 gap-6 overflow-hidden pt-4">
          {/* Configuration Panel */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">1. Define Off-Service Rotations</h3>
              <div className="flex gap-2">
                <Input value={newRotationName} onChange={e => setNewRotationName(e.target.value)} placeholder="e.g., Neuroradiology" />
                <Button size="icon" onClick={handleAddRotationType}><PlusCircle /></Button>
              </div>
              <ScrollArea className="h-24 mt-2">
                <div className="space-y-1 pr-4">
                    {offServiceRotations.map(rot => (
                        <div key={rot.id} className="flex justify-between items-center text-sm p-1 bg-muted/50 rounded">
                        <span>{rot.name}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveRotationType(rot.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                        </div>
                    ))}
                </div>
              </ScrollArea>
            </div>

            <div className="p-4 border rounded-lg flex-1 flex flex-col">
              <h3 className="font-semibold mb-2">2. Assign Rotations to Residents</h3>
              <div className="grid grid-cols-2 gap-2">
                 <Select value={newRequest.residentId} onValueChange={val => setNewRequest(p => ({...p, residentId: val}))}><SelectTrigger><SelectValue placeholder="Select resident..."/></SelectTrigger><SelectContent>{neuroResidents.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
                 <Select value={newRequest.rotationId} onValueChange={val => setNewRequest(p => ({...p, rotationId: val}))}><SelectTrigger><SelectValue placeholder="Select rotation..."/></SelectTrigger><SelectContent>{offServiceRotations.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
                 <Input type="number" min="1" placeholder="Blocks (e.g., 1)" value={newRequest.durationInBlocks || ''} onChange={e => setNewRequest(p => ({...p, durationInBlocks: parseInt(e.target.value)}))}/>
                 <Select value={newRequest.timingPreference} onValueChange={val => setNewRequest(p => ({...p, timingPreference: val as any}))}><SelectTrigger><SelectValue placeholder="Timing..."/></SelectTrigger><SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="early">Early</SelectItem><SelectItem value="mid">Mid</SelectItem><SelectItem value="late">Late</SelectItem></SelectContent></Select>
              </div>
              <Button onClick={handleAddRequest} className="mt-2 w-full"><PlusCircle className="mr-2"/>Add Request</Button>
              <ScrollArea className="flex-1 mt-2">
                 <div className="space-y-1 pr-4">
                    {offServiceRequests.map(req => (
                        <div key={req.id} className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded">
                            <span><b>{getResidentName(req.residentId)}:</b> {getRotationName(req.rotationId)} ({req.durationInBlocks} block{req.durationInBlocks > 1 ? 's' : ''})</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveRequest(req.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                        </div>
                    ))}
                 </div>
              </ScrollArea>
            </div>
            
            <Button size="lg" onClick={handleGenerateSchedule} disabled={isLoading}>
                {isLoading ? 'Generating...' : <><Bot className="mr-2"/> Generate Yearly Schedule</>}
            </Button>
          </div>

          {/* Schedule Display Panel */}
          <div className="md:col-span-2 overflow-hidden flex flex-col">
             {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                    <Bot className="h-16 w-16 mb-4 animate-spin text-primary" />
                    <h3 className="text-lg font-semibold">AI is optimizing the yearly schedule...</h3>
                    <p>This may take a moment.</p>
                </div>
             ) : generatedSchedule ? (
                <>
                  {generatedSchedule.violations && generatedSchedule.violations.length > 0 && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
                      <h3 className="font-semibold text-destructive flex items-center gap-2"><AlertTriangle/>Constraint Violations</h3>
                      <ul className="list-disc pl-5 text-sm text-destructive/90">
                        {generatedSchedule.violations.map((v: string, i: number) => <li key={i}>{v}</li>)}
                      </ul>
                    </div>
                  )}
                  <ScrollArea className="flex-1">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                          <TableHead className="sticky left-0 bg-background z-20 font-bold min-w-[150px]">Resident</TableHead>
                          {[...Array(13)].map((_, i) => <TableHead key={i} className="text-center">Block {i + 1}</TableHead>)}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {generatedSchedule.yearlySchedule.map((entry: any) => {
                          const resident = neuroResidents.find(r => r.id === entry.residentId);
                          return (
                            <TableRow key={entry.residentId}>
                              <TableCell className="sticky left-0 bg-background z-10 font-medium">
                                <div>{resident?.name}</div>
                                <div className="text-xs text-muted-foreground">PGY-{resident?.level}</div>
                              </TableCell>
                              {entry.schedule.map((rot: string, i: number) => (
                                <TableCell key={i} className={cn("text-center text-xs p-2", rot !== 'Neurosurgery' && 'bg-blue-100 dark:bg-blue-900/50')}>{rot}</TableCell>
                              ))}
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </>
             ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground bg-muted/50 rounded-lg">
                    <CalendarDays className="h-16 w-16 mb-4" />
                    <h3 className="text-lg font-semibold">Ready to Plan Your Year</h3>
                    <p>Configure off-service requests and click "Generate" to see the schedule here.</p>
                </div>
             )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
