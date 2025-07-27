
import React, { useState } from 'react';
import type { AppState, Resident, Evaluation, EvaluationStatus, EPA } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { v4 as uuidv4 } from 'uuid';
import { MoreVertical, Edit, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { evalEPAs } from '@/data/evaluations';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface EvaluationsPageProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

const evaluationInitialState = {
    epaId: '',
    residentId: '',
    evaluatorId: '',
    status: 'draft' as EvaluationStatus,
    activityDescription: '',
    activityDate: '',
    evaluationDate: new Date().toLocaleDateString(),
    milestoneRatings: {},
    overallRating: 0,
    feedback: '',
}

export function EvaluationsPage({ appState, setAppState }: EvaluationsPageProps) {
  const { residents } = appState;
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<Partial<Evaluation>>(evaluationInitialState);

  const neuroResidents = residents.filter(r => r.type === 'neuro');
  const availableEPAs = evalEPAs;

  const handleSheetOpen = () => {
    setIsSheetOpen(true);
  };

   const handleSheetClose = () => {
        setIsSheetOpen(false);
        setCurrentEvaluation(evaluationInitialState);
    };

  const handleSaveEvaluation = () => {
    if (!currentEvaluation.epaId || !currentEvaluation.residentId || !currentEvaluation.evaluatorId) return;

    const newEvaluation: Evaluation = {
      id: uuidv4(),
      epaId: currentEvaluation.epaId,
      residentId: currentEvaluation.residentId,
      evaluatorId: currentEvaluation.evaluatorId,
      status: currentEvaluation.status || 'draft',
      activityDescription: currentEvaluation.activityDescription || '',
      activityDate: currentEvaluation.activityDate || '',
      evaluationDate: new Date().toLocaleDateString(),
      milestoneRatings: currentEvaluation.milestoneRatings || {},
      overallRating: currentEvaluation.overallRating || 0,
      feedback: currentEvaluation.feedback || '',
    };

    setAppState(prev => prev ? ({ ...prev, evaluations: [...prev.evaluations, newEvaluation] }) : null);
    handleSheetClose();
  };
  
  const handleDeleteEvaluation = (evaluationId: string) => {
      setAppState(prev => prev ? ({...prev, evaluations: prev.evaluations.filter(e => e.id !== evaluationId)}) : prev);
  };

  const getStatusColor = (status: EvaluationStatus) => {
    switch (status) {
      case 'pending': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'draft': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Evaluations</h2>
        <Button onClick={handleSheetOpen}>Create Evaluation</Button>
      </div>

      {appState.evaluations.length === 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-500">No evaluations created yet.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-auto">
          <Table>
            <TableCaption>A list of all the evaluations in your account. Click on a row to edit.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Status</TableHead>
                <TableHead>Resident</TableHead>
                <TableHead>EPA</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Activity Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appState.evaluations.map(evaluation => (
                <TableRow key={evaluation.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1">
                      {evaluation.status === 'pending' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {evaluation.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {evaluation.status === 'draft' && <Edit className="w-4 h-4 text-gray-500" />}
                      <span className={getStatusColor(evaluation.status)}>{evaluation.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{residents.find(r => r.id === evaluation.residentId)?.name}</TableCell>
                  <TableCell>{evalEPAs.find(epa => epa.id === evaluation.epaId)?.title}</TableCell>
                  <TableCell>{evaluation.activityDescription}</TableCell>
                  <TableCell>{evaluation.activityDate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                                setCurrentEvaluation(evaluation);
                                handleSheetOpen();
                            }}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteEvaluation(evaluation.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button>Open Sheet</Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Create Evaluation</SheetTitle>
            <SheetDescription>
              Create a new evaluation for a resident.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="resident">Resident</Label>
                <Select onValueChange={(value) => setCurrentEvaluation(prev => ({ ...prev, residentId: value }))} defaultValue={currentEvaluation.residentId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a resident" />
                  </SelectTrigger>
                  <SelectContent>
                    {neuroResidents.map(resident => (
                      <SelectItem key={resident.id} value={resident.id}>{resident.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="epa">EPA</Label>
                <Select onValueChange={(value) => setCurrentEvaluation(prev => ({ ...prev, epaId: value }))} defaultValue={currentEvaluation.epaId}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select an EPA" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEPAs.map(epa => (
                      <SelectItem key={epa.id} value={epa.id}>{epa.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status">Status</Label>
                <RadioGroup defaultValue={currentEvaluation.status} className="col-span-3 flex space-x-2" onValueChange={(value) => setCurrentEvaluation(prev => ({ ...prev, status: value as EvaluationStatus }))}>
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft">Draft</Label>
                  <RadioGroupItem value="pending" id="pending" />
                  <Label htmlFor="pending">Pending</Label>
                  <RadioGroupItem value="completed" id="completed" />
                  <Label htmlFor="completed">Completed</Label>
                </RadioGroup>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activityDescription">Activity Description</Label>
                <Input id="activityDescription" defaultValue={currentEvaluation.activityDescription} className="col-span-3" onChange={(e) => setCurrentEvaluation(prev => ({ ...prev, activityDescription: e.target.value }))} />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="activityDate">Activity Date</Label>
                <Input id="activityDate" type="date" defaultValue={currentEvaluation.activityDate} className="col-span-3" onChange={(e) => setCurrentEvaluation(prev => ({ ...prev, activityDate: e.target.value }))} />
              </div>
            </div>
          <Button onClick={handleSaveEvaluation}>Save Changes</Button>
        </SheetContent>
      </Sheet>
    </div>
  );
}
