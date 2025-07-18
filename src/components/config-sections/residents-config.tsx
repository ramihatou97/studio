import type { AppState, Resident, MedicalStudent, OtherLearner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResidentCard } from './resident-card';
import { MedicalStudentCard } from './student-card';
import { OtherLearnerCard } from './other-learner-card';
import { addNeuroResident, addNonNeuroResident, addMedicalStudent, addOtherLearner } from "@/lib/config-helpers";
import { PlusCircle } from "lucide-react";

interface ResidentsConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

export function ResidentsConfig({ appState, setAppState }: ResidentsConfigProps) {
  const { residents, medicalStudents, otherLearners } = appState;
  const neuroResidents = residents.filter(r => r.type === 'neuro');
  const nonNeuroResidents = residents.filter(r => r.type === 'non-neuro');

  const updateResident = (id: string, updatedResident: Partial<Resident>) => {
    setAppState(prev => prev ? ({
      ...prev,
      residents: prev.residents.map(r => r.id === id ? { ...r, ...updatedResident } : r),
    }) : null);
  };
  
  const removeResident = (id: string) => {
    setAppState(prev => prev ? ({
      ...prev,
      residents: prev.residents.filter(r => r.id !== id),
    }) : null);
  };

  const updateStudent = (id: string, updatedStudent: Partial<MedicalStudent>) => {
    setAppState(prev => prev ? ({
      ...prev,
      medicalStudents: prev.medicalStudents.map(s => s.id === id ? { ...s, ...updatedStudent } : s),
    }) : null);
  };

  const removeStudent = (id: string) => {
    setAppState(prev => prev ? ({
      ...prev,
      medicalStudents: prev.medicalStudents.filter(s => s.id !== id),
    }) : null);
  };
  
  const updateLearner = (id: string, updatedLearner: Partial<OtherLearner>) => {
    setAppState(prev => prev ? ({
      ...prev,
      otherLearners: prev.otherLearners.map(l => l.id === id ? { ...l, ...updatedLearner } : l),
    }) : null);
  };

  const removeLearner = (id: string) => {
    setAppState(prev => prev ? ({
      ...prev,
      otherLearners: prev.otherLearners.filter(l => l.id !== id),
    }) : null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnel Configuration</CardTitle>
        <CardDescription>Add and manage all residents and learners in the program.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="neuro" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="neuro">Neuro</TabsTrigger>
            <TabsTrigger value="non-neuro">Non-Neuro</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
          
          <TabsContent value="neuro" className="pt-4">
            <div id="resident-list" className="space-y-4 mb-4">
              {neuroResidents.map(resident => (
                <ResidentCard key={resident.id} resident={resident} updateResident={updateResident} removeResident={removeResident} appState={appState} setAppState={setAppState} />
              ))}
            </div>
            <Button onClick={() => addNeuroResident(setAppState)} className="w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Neurosurgery Resident</Button>
          </TabsContent>

          <TabsContent value="non-neuro" className="pt-4">
            <div id="non-neuro-resident-list" className="space-y-4 mb-4">
              {nonNeuroResidents.map(resident => (
                <ResidentCard key={resident.id} resident={resident} updateResident={updateResident} removeResident={removeResident} appState={appState} setAppState={setAppState}/>
              ))}
            </div>
            <Button onClick={() => addNonNeuroResident(setAppState)} className="w-full bg-teal-600 hover:bg-teal-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Non-Neurosurgical Resident</Button>
          </TabsContent>
          
          <TabsContent value="students" className="pt-4">
            <div id="student-list" className="space-y-4 mb-4">
              {medicalStudents.map(student => (
                <MedicalStudentCard key={student.id} student={student} updateStudent={updateStudent} removeStudent={removeStudent} />
              ))}
            </div>
            <Button onClick={() => addMedicalStudent(setAppState)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Medical Student</Button>
          </TabsContent>

          <TabsContent value="other" className="pt-4">
            <div id="other-learner-list" className="space-y-4 mb-4">
              {otherLearners.map(learner => (
                <OtherLearnerCard key={learner.id} learner={learner} updateLearner={updateLearner} removeLearner={removeLearner} />
              ))}
            </div>
            <Button onClick={() => addOtherLearner(setAppState)} className="w-full bg-slate-600 hover:bg-slate-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Other Learner</Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
