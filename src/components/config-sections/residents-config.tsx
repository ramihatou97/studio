import type { AppState, Resident, MedicalStudent, OtherLearner } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResidentCard } from './resident-card';
import { MedicalStudentCard } from './student-card';
import { OtherLearnerCard } from './other-learner-card';
import { addNeuroResident, addNonNeuroResident, addMedicalStudent, addOtherLearner } from "@/lib/config-helpers";
import { PlusCircle } from "lucide-react";

interface ResidentsConfigProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function ResidentsConfig({ appState, setAppState }: ResidentsConfigProps) {
  const { residents, medicalStudents, otherLearners } = appState;
  const neuroResidents = residents.filter(r => r.type === 'neuro');
  const nonNeuroResidents = residents.filter(r => r.type === 'non-neuro');

  const updateResident = (id: string, updatedResident: Partial<Resident>) => {
    setAppState(prev => ({
      ...prev,
      residents: prev.residents.map(r => r.id === id ? { ...r, ...updatedResident } : r),
    }));
  };
  
  const removeResident = (id: string) => {
    setAppState(prev => ({
      ...prev,
      residents: prev.residents.filter(r => r.id !== id),
    }));
  };

  const updateStudent = (id: string, updatedStudent: Partial<MedicalStudent>) => {
    setAppState(prev => ({
      ...prev,
      medicalStudents: prev.medicalStudents.map(s => s.id === id ? { ...s, ...updatedStudent } : s),
    }));
  };

  const removeStudent = (id: string) => {
    setAppState(prev => ({
      ...prev,
      medicalStudents: prev.medicalStudents.filter(s => s.id !== id),
    }));
  };
  
  const updateLearner = (id: string, updatedLearner: Partial<OtherLearner>) => {
    setAppState(prev => ({
      ...prev,
      otherLearners: prev.otherLearners.map(l => l.id === id ? { ...l, ...updatedLearner } : l),
    }));
  };

  const removeLearner = (id: string) => {
    setAppState(prev => ({
      ...prev,
      otherLearners: prev.otherLearners.filter(l => l.id !== id),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personnel Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Neurosurgery Residents</h3>
          <div id="resident-list" className="space-y-4 mb-4">
            {neuroResidents.map(resident => (
              <ResidentCard key={resident.id} resident={resident} updateResident={updateResident} removeResident={removeResident} appState={appState} setAppState={setAppState} />
            ))}
          </div>
          <Button onClick={() => addNeuroResident(setAppState)} className="w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Neurosurgery Resident</Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Non-Neurosurgical Residents</h3>
          <div id="non-neuro-resident-list" className="space-y-4 mb-4">
            {nonNeuroResidents.map(resident => (
              <ResidentCard key={resident.id} resident={resident} updateResident={updateResident} removeResident={removeResident} appState={appState} setAppState={setAppState}/>
            ))}
          </div>
          <Button onClick={() => addNonNeuroResident(setAppState)} className="w-full bg-teal-600 hover:bg-teal-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Non-Neurosurgical Resident</Button>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Medical Students</h3>
          <div id="student-list" className="space-y-4 mb-4">
            {medicalStudents.map(student => (
              <MedicalStudentCard key={student.id} student={student} updateStudent={updateStudent} removeStudent={removeStudent} />
            ))}
          </div>
          <Button onClick={() => addMedicalStudent(setAppState)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Medical Student</Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Other Learners (PA Students, etc.)</h3>
          <div id="other-learner-list" className="space-y-4 mb-4">
            {otherLearners.map(learner => (
              <OtherLearnerCard key={learner.id} learner={learner} updateLearner={updateLearner} removeLearner={removeLearner} />
            ))}
          </div>
          <Button onClick={() => addOtherLearner(setAppState)} className="w-full bg-slate-600 hover:bg-slate-700 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Add Other Learner</Button>
        </div>
      </CardContent>
    </Card>
  );
}
