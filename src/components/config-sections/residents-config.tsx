
import type { AppState, Resident, MedicalStudent, OtherLearner, CaseRoundAssignment, ArticleDiscussion, MMRound } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResidentCard } from './resident-card';
import { MedicalStudentCard } from './student-card';
import { OtherLearnerCard } from './other-learner-card';
import { addNeuroResident, addNonNeuroResident, addMedicalStudent, addOtherLearner } from "@/lib/config-helpers";
import { PlusCircle, BookOpen, Stethoscope, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface ResidentsConfigProps {
  appState: AppState;
  setAppState: (updater: React.SetStateAction<AppState | null>) => void;
}

function AcademicEventsConfig({ appState, setAppState }: ResidentsConfigProps) {
  const [caseRound, setCaseRound] = useState<Partial<CaseRoundAssignment>>({});
  const [articleDiscussion, setArticleDiscussion] = useState<Partial<ArticleDiscussion>>({});
  const [mmRound, setMmRound] = useState<Partial<MMRound>>({});

  const { residents, staff, general } = appState;
  const { startDate, endDate } = general;
  const neuroResidents = residents.filter(r => r.type === 'neuro');

  const numberOfDays = (() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  })();

  const getFridays = () => {
    const fridays = [];
    if (!startDate || !endDate) return fridays;
    const start = new Date(startDate);
    for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        if (currentDate.getDay() === 5) { // Friday
            fridays.push({ label: currentDate.toLocaleDateString(), value: i });
        }
    }
    return fridays;
  };

  const getWednesdays = (weekNumber: 2 | 3) => {
    const wednesdays = [];
    if (!startDate || !endDate) return wednesdays;
    const start = new Date(startDate);
    let wednesdayCount = 0;
    for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + i);
        if (currentDate.getDay() === 3) { // Wednesday
            wednesdayCount++;
            if (wednesdayCount === weekNumber) {
                wednesdays.push({ label: currentDate.toLocaleDateString(), value: i });
            }
        }
        if(currentDate.getDate() === 1 && i > 0) wednesdayCount = 0;
    }
    return wednesdays;
  }

  const handleAddCaseRound = () => {
    if (caseRound.dayIndex === undefined || !caseRound.residentId) return;
    setAppState(prev => prev ? ({ ...prev, caseRounds: [...prev.caseRounds, caseRound as CaseRoundAssignment] }) : null);
    setCaseRound({});
  };
  
  const handleAddArticleDiscussion = () => {
    if (articleDiscussion.dayIndex === undefined || !articleDiscussion.staffId || !articleDiscussion.article1 || !articleDiscussion.article2) return;
    setAppState(prev => prev ? ({ ...prev, articleDiscussions: [...prev.articleDiscussions, articleDiscussion as ArticleDiscussion] }) : null);
    setArticleDiscussion({});
  };
  
  const handleAddMMRound = () => {
    if (mmRound.dayIndex === undefined) return;
    setAppState(prev => prev ? ({ ...prev, mmRounds: [...prev.mmRounds, mmRound as MMRound] }) : null);
    setMmRound({});
  };

  return (
      <Accordion type="single" collapsible className="w-full space-y-4 mt-6">
        <AccordionItem value="academic-events">
            <AccordionTrigger className="text-lg font-medium">Academic Events</AccordionTrigger>
            <AccordionContent>
                {/* Case-Based Rounds */}
                <Card className="mb-4">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Stethoscope/>Case-Based Rounds</CardTitle><CardDescription>Assign a resident to present a case every Friday morning.</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select onValueChange={(val) => setCaseRound(p => ({...p, dayIndex: Number(val)}))}><SelectTrigger><SelectValue placeholder="Select Friday..."/></SelectTrigger><SelectContent>{getFridays().map(f => <SelectItem key={f.value} value={String(f.value)}>{f.label}</SelectItem>)}</SelectContent></Select>
                            <Select onValueChange={(val) => setCaseRound(p => ({...p, residentId: val}))}><SelectTrigger><SelectValue placeholder="Select Resident..."/></SelectTrigger><SelectContent>{neuroResidents.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent></Select>
                            <Button onClick={handleAddCaseRound}>Add Assignment</Button>
                        </div>
                         <div className="space-y-1 pt-2">
                            {appState.caseRounds.map((cr, i) => <div key={i} className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded"><span>{new Date(new Date(startDate).setDate(new Date(startDate).getDate() + cr.dayIndex)).toLocaleDateString()}: <b>{residents.find(r=>r.id === cr.residentId)?.name}</b></span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAppState(p => p ? ({...p, caseRounds: p.caseRounds.filter((_,idx)=>idx!==i)}) : p)}><Trash2 className="h-4 w-4"/></Button></div>)}
                        </div>
                    </CardContent>
                </Card>
                {/* Article Discussions */}
                <Card className="mb-4">
                    <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen/>Article Discussions (Journal Club)</CardTitle><CardDescription>Assign a staff to lead discussion on two articles on the 2nd Wednesday of the month.</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Select onValueChange={(val) => setArticleDiscussion(p => ({...p, dayIndex: Number(val)}))}><SelectTrigger><SelectValue placeholder="Select 2nd Wednesday..."/></SelectTrigger><SelectContent>{getWednesdays(2).map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent></Select>
                             <Select onValueChange={(val) => setArticleDiscussion(p => ({...p, staffId: val}))}><SelectTrigger><SelectValue placeholder="Select Staff..."/></SelectTrigger><SelectContent>{staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                        </div>
                        <Input placeholder="Article 1 Title/Link" value={articleDiscussion.article1 || ''} onChange={e => setArticleDiscussion(p => ({...p, article1: e.target.value}))}/>
                        <Input placeholder="Article 2 Title/Link" value={articleDiscussion.article2 || ''} onChange={e => setArticleDiscussion(p => ({...p, article2: e.target.value}))}/>
                        <Input placeholder="Zoom Link (optional)" value={articleDiscussion.zoomLink || ''} onChange={e => setArticleDiscussion(p => ({...p, zoomLink: e.target.value}))}/>
                        <Button onClick={handleAddArticleDiscussion} className="w-full">Add Discussion</Button>
                         <div className="space-y-1 pt-2">
                            {appState.articleDiscussions.map((ad, i) => <div key={i} className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded"><span>{new Date(new Date(startDate).setDate(new Date(startDate).getDate() + ad.dayIndex)).toLocaleDateString()}: <b>{staff.find(s=>s.id === ad.staffId)?.name}</b></span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAppState(p => p ? ({...p, articleDiscussions: p.articleDiscussions.filter((_,idx)=>idx!==i)}) : p)}><Trash2 className="h-4 w-4"/></Button></div>)}
                        </div>
                    </CardContent>
                </Card>
                {/* M&M Rounds */}
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users/>Mortality & Morbidity Rounds</CardTitle><CardDescription>Schedule M&M rounds for the 3rd Wednesday of the month.</CardDescription></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Select onValueChange={(val) => setMmRound(p => ({...p, dayIndex: Number(val)}))}><SelectTrigger><SelectValue placeholder="Select 3rd Wednesday..."/></SelectTrigger><SelectContent>{getWednesdays(3).map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent></Select>
                            <Input placeholder="Zoom Link (optional)" value={mmRound.zoomLink || ''} onChange={e => setMmRound(p => ({...p, zoomLink: e.target.value}))}/>
                        </div>
                        <Button onClick={handleAddMMRound} className="w-full">Add M&M Round</Button>
                         <div className="space-y-1 pt-2">
                            {appState.mmRounds.map((mm, i) => <div key={i} className="flex justify-between items-center text-sm p-1.5 bg-muted/50 rounded"><span>{new Date(new Date(startDate).setDate(new Date(startDate).getDate() + mm.dayIndex)).toLocaleDateString()}: M&M Round</span><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setAppState(p => p ? ({...p, mmRounds: p.mmRounds.filter((_,idx)=>idx!==i)}) : p)}><Trash2 className="h-4 w-4"/></Button></div>)}
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
  );
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
        <CardTitle>Personnel & Academic Events</CardTitle>
        <CardDescription>Add and manage all residents, learners, and academic events in the program.</CardDescription>
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
            <Button onClick={() => addNonNeuroResident(setAppState)} className="w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Non-Neurosurgical Resident</Button>
          </TabsContent>
          
          <TabsContent value="students" className="pt-4">
            <div id="student-list" className="space-y-4 mb-4">
              {medicalStudents.map(student => (
                <MedicalStudentCard key={student.id} student={student} updateStudent={updateStudent} removeStudent={removeStudent} />
              ))}
            </div>
            <Button onClick={() => addMedicalStudent(setAppState)} className="w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Medical Student</Button>
          </TabsContent>

          <TabsContent value="other" className="pt-4">
            <div id="other-learner-list" className="space-y-4 mb-4">
              {otherLearners.map(learner => (
                <OtherLearnerCard key={learner.id} learner={learner} updateLearner={updateLearner} removeLearner={removeLearner} />
              ))}
            </div>
            <Button onClick={() => addOtherLearner(setAppState)} className="w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Other Learner</Button>
          </TabsContent>
        </Tabs>
        <AcademicEventsConfig appState={appState} setAppState={setAppState} />
      </CardContent>
    </Card>
  );
}
