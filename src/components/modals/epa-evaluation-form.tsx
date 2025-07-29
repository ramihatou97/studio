
"use client";
import { useState, useRef, useMemo, useEffect } from 'react';
import type { EPA, Milestone } from '@/lib/epa-data';
import type { AppState, Evaluation, ResidentRole, CurrentUser } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { StarRating } from '../epa/star-rating';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Download, Send } from 'lucide-react';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { v4 as uuidv4 } from 'uuid';
import * as React from 'react';

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica', fontSize: 11, color: '#333' },
  header: { textAlign: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#624BFF' },
  subtitle: { fontSize: 12, color: '#555' },
  section: { marginBottom: 15, border: '1px solid #eee', borderRadius: 5, padding: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4, color: '#624BFF' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  gridItem: { flex: 1 },
  label: { fontSize: 10, color: '#666', marginBottom: 2 },
  value: { fontSize: 11, fontWeight: 'bold' },
  milestone: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottom: '1px dotted #ccc' },
  milestoneText: { flex: 1, marginRight: 10 },
  rating: { fontWeight: 'bold' },
  feedback: { marginTop: 5, fontStyle: 'italic' }
});

const EpaPdfDocument = ({ epa, evaluation, appState }: { epa: EPA, evaluation: Evaluation, appState: AppState }) => {
    const resident = appState.residents.find(r => r.id === evaluation.residentId);
    const evaluator = appState.staff.find(s => s.id === evaluation.evaluatorId);
    return (
        <Document>
            <Page style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>EPA Evaluation: {epa.id}</Text>
                    <Text style={styles.subtitle}>{epa.title}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Evaluation Details</Text>
                    <View style={styles.grid}>
                        <View style={styles.gridItem}><Text style={styles.label}>Resident</Text><Text style={styles.value}>{resident?.name || 'N/A'}</Text></View>
                        <View style={styles.gridItem}><Text style={styles.label}>Evaluator</Text><Text style={styles.value}>{evaluator?.name || 'N/A'}</Text></View>
                    </View>
                    <View style={styles.grid}>
                       <View style={styles.gridItem}><Text style={styles.label}>Activity Date</Text><Text style={styles.value}>{evaluation.activityDate}</Text></View>
                       <View style={styles.gridItem}><Text style={styles.label}>Evaluation Date</Text><Text style={styles.value}>{evaluation.evaluationDate ? new Date(evaluation.evaluationDate).toLocaleDateString() : 'N/A'}</Text></View>
                    </View>
                     <Text style={styles.label}>Activity</Text><Text style={styles.value}>{evaluation.activityDescription}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overall Assessment</Text>
                     <View style={styles.grid}>
                        <View style={styles.gridItem}><Text style={styles.label}>Overall Entrustment Score</Text><Text style={styles.value}>{evaluation.overallRating} / 5</Text></View>
                    </View>
                    <Text style={styles.label}>Narrative Feedback</Text>
                    <Text style={styles.feedback}>"{evaluation.feedback || 'No feedback provided.'}"</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Milestone Ratings</Text>
                    {epa.milestones.map((milestone, index) => (
                        <View key={index} style={styles.milestone}>
                            <Text style={styles.milestoneText}>{milestone.text}</Text>
                            <Text style={styles.rating}>{evaluation.milestoneRatings[index] || 'N/R'} / 5</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    );
};


interface EpaEvaluationFormProps {
  evaluation: Evaluation;
  epa: EPA;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete: () => void;
  currentUser: CurrentUser;
  evaluationMode: 'request' | 'evaluate';
}

export function EpaEvaluationForm({ 
  evaluation,
  epa, 
  appState, 
  setAppState,
  onComplete,
  currentUser,
  evaluationMode,
}: EpaEvaluationFormProps) {
  const [evalData, setEvalData] = useState<Evaluation>(evaluation);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const { staff, residents } = appState;

  const handleUpdate = (field: keyof Evaluation, value: any) => {
    setEvalData(prev => ({ ...prev, [field]: value }));
  };

  const isResidentInitiator = currentUser.role === 'resident';

  const juniorResidents = React.useMemo(() => {
    if (!isResidentInitiator) return [];
    const currentUserLevel = residents.find(r => r.id === currentUser.id)?.level || 0;
    return residents.filter(r => r.id !== currentUser.id && r.level < currentUserLevel);
  }, [isResidentInitiator, currentUser.id, residents]);
  
  const handleRequest = () => {
    if (!evalData.evaluatorId) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please select a supervising staff member." });
        return;
    }
    if (!evalData.activityDescription || evalData.activityDescription.trim() === '') {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please provide a description of the clinical activity." });
        return;
    }

    setIsProcessing(true);
    // In a real app, this would trigger a backend process to send an email.
    // Here, we'll simulate it by creating a "pending" evaluation in the state.
    const requestToken = uuidv4(); // Unique token for the magic link
    const updatedEval: Evaluation = { ...evalData, status: 'pending', requestToken };
    
    setAppState(prev => {
        const otherEvals = prev.evaluations.filter(e => e.id !== updatedEval.id);
        return { ...prev, evaluations: [...otherEvals, updatedEval] };
    });

    // Simulate sending an email with a magic link
    const magicLink = `${window.location.origin}/evaluate/${requestToken}`;
    console.log(`Simulated email sent to ${staff.find(s=>s.id === evalData.evaluatorId)?.email} with link: ${magicLink}`);
    
    toast({
        title: "Evaluation Request Sent",
        description: "The evaluator has been notified. You can track the status on your dashboard."
    });
    
    setIsProcessing(false);
    onComplete();
  };
  
  const handleSubmit = () => {
    if (!evalData.residentId) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please select a resident." });
        return;
    }
    if (!evalData.activityDescription || evalData.activityDescription.trim() === '') {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please provide a description of the clinical activity." });
        return;
    }
    if (evalData.overallRating === 0) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please provide an overall entrustment score." });
        return;
    }
    if (!evalData.feedback || evalData.feedback.trim() === '') {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please provide narrative feedback." });
        return;
    }
    const missingMilestoneRatings = epa.milestones.some((_, index) => !evalData.milestoneRatings[index] || evalData.milestoneRatings[index] === 0);
    if (missingMilestoneRatings) {
        toast({ variant: 'destructive', title: "Validation Error", description: "Please rate all milestones." });
        return;
    }
    setIsProcessing(true);
    
    const completedEval: Evaluation = { 
        ...evalData, 
        status: 'completed', 
        evaluationDate: new Date().toISOString(),
    };
    
    setAppState(prev => {
        const otherEvals = prev.evaluations.filter(e => e.id !== completedEval.id);
        return { ...prev, evaluations: [...otherEvals, completedEval] };
    });

    toast({ title: "Evaluation Submitted", description: "The evaluation has been saved." });
    
    setIsProcessing(false);
    onComplete();
  };

  const getActionButtons = () => {
    if (evaluationMode === 'request') {
        return (
            <Button className="w-full" onClick={handleRequest} disabled={isProcessing}>
                {isProcessing ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Request to Staff</>}
            </Button>
        );
    } else { // 'evaluate'
        return (
            <Button className="w-full" onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? 'Submitting...' : 'Submit Evaluation'}
            </Button>
        );
    }
  };

  const memoizedPdfDocument = React.useMemo(() => (
    <EpaPdfDocument epa={epa} evaluation={evalData} appState={appState} />
  ), [epa, evalData, appState]);
  
  const isResidentSelectionDisabled = isResidentInitiator && evaluationMode === 'request';
  const isEvaluatorSelectionDisabled = !isResidentInitiator;

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div className="p-1">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                  {/* Resident selection */}
                  <div>
                      <Label>Resident</Label>
                       <Select 
                          value={evalData.residentId} 
                          onValueChange={(val) => handleUpdate('residentId', val)} 
                          disabled={isResidentSelectionDisabled}
                      >
                          <SelectTrigger><SelectValue placeholder="Choose a resident..." /></SelectTrigger>
                          <SelectContent>
                              {isResidentInitiator && evaluationMode === 'evaluate' ? (
                                  juniorResidents.map(r => (
                                      <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                                  ))
                              ) : (
                                  appState.residents.filter(r => r.type === 'neuro').map(r => (
                                      <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                                  ))
                              )}
                          </SelectContent>
                      </Select>
                  </div>

                  {/* Evaluator selection */}
                  <div>
                      <Label>Evaluator</Label>
                      <Select 
                        value={evalData.evaluatorId} 
                        onValueChange={(val) => handleUpdate('evaluatorId', val)}
                        disabled={isEvaluatorSelectionDisabled}
                      >
                          <SelectTrigger><SelectValue placeholder="Choose an evaluator..." /></SelectTrigger>
                          <SelectContent>
                              {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                      </Select>
                  </div>
              </div>
               <div className="mt-4"> 
                  <Label>Clinical Activity / Event</Label>
                  <Input 
                      placeholder="Describe the activity being evaluated..." 
                      value={evalData.activityDescription} 
                      onChange={(e) => handleUpdate('activityDescription', e.target.value)} 
                      disabled={!evalData.residentId}
                  />
              </div>
            </CardContent>
          </Card>
          
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="epa-details">
              <AccordionTrigger className="text-lg font-medium p-4 border rounded-lg bg-muted/50">View EPA Details: {epa.id}</AccordionTrigger>
              <AccordionContent className="border rounded-b-lg p-4">
                 <CardHeader className="p-0">
                    <CardTitle>{epa.title}</CardTitle>
                    <CardDescription>{epa.keyFeatures}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <h4 className="font-semibold mt-4 mb-2">Assessment Plan:</h4>
                    <p className="text-sm text-muted-foreground">{epa.assessmentPlan}</p>
                </CardContent>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <Card className="mt-4">
             <CardHeader>
              <CardTitle>Milestone Evaluation</CardTitle>
              <CardDescription>Rate each milestone on a scale of 1 (pre-entrustable) to 5 (aspirational).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {epa.milestones.map((milestone, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg bg-muted/50 gap-2">
                    <p className="flex-1 text-sm">{milestone.text}</p>
                    <StarRating rating={evalData.milestoneRatings[index] || 0} onRatingChange={(rating) => handleUpdate('milestoneRatings', {...evalData.milestoneRatings, [index]: rating})} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
                <CardTitle>Overall Assessment & Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label className="font-semibold">Overall Entrustment Score</Label>
                    <p className="text-xs text-muted-foreground mb-2">How much supervision was required for this activity?</p>
                    <StarRating rating={evalData.overallRating} onRatingChange={(val) => handleUpdate('overallRating', val)} />
                </div>
                <div>
                    <Label className="font-semibold">Narrative Feedback</Label>
                    <p className="text-xs text-muted-foreground mb-2">Provide specific comments on strengths and areas for improvement.</p>
                    <Textarea value={evalData.feedback} onChange={e => handleUpdate('feedback', e.target.value)} rows={4} placeholder="Feedback..." />
                </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
       <CardFooter className="pt-6 border-t gap-2">
            <PDFDownloadLink
                document={memoizedPdfDocument}
                fileName={`EPA_${epa.id.replace(/\s/g, '_')}_${appState.residents.find(r => r.id === evalData.residentId)?.name.replace(/\s/g, '_') || 'resident'}.pdf`}
                className="w-full"
            >
                {({ blob, url, loading, error }) => (
                    <Button variant="outline" className="w-full" disabled={loading}>
                        {loading ? 'Generating...' : <><Download className="mr-2 h-4 w-4" /> Export as PDF</>}
                    </Button>
                )}
            </PDFDownloadLink>
          {getActionButtons()}
        </CardFooter>
    </div>
  );
}
