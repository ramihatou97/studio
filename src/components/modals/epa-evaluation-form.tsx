
"use client";
import { useState, useRef, useEffect, useMemo } from 'react';
import type { EPA, Milestone } from '@/lib/epa-data';
import type { AppState, Evaluation } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { StarRating } from '../epa/star-rating';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Download, Send } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { v4 as uuidv4 } from 'uuid';

interface EpaEvaluationFormProps {
  evaluation: Evaluation;
  epa: EPA;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onComplete: () => void;
}

export function EpaEvaluationForm({ 
  evaluation,
  epa, 
  appState, 
  setAppState,
  onComplete,
}: EpaEvaluationFormProps) {
  const [evalData, setEvalData] = useState<Evaluation>(evaluation);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentUser, staff } = appState;
  
  const handleUpdate = (field: keyof Evaluation, value: any) => {
    setEvalData(prev => ({ ...prev, [field]: value }));
  };

  const isResidentRequesting = currentUser.role === 'resident';

  const handleRequest = () => {
    if (!evalData.evaluatorId) {
        toast({ variant: 'destructive', title: "Please select a supervising staff member." });
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
    setIsProcessing(true);
    const completedEval: Evaluation = { ...evalData, status: 'completed', evaluationDate: new Date().toISOString() };
    
    setAppState(prev => {
        const otherEvals = prev.evaluations.filter(e => e.id !== completedEval.id);
        return { ...prev, evaluations: [...otherEvals, completedEval] };
    });

    toast({ title: "Evaluation Submitted", description: "The evaluation has been saved to the resident's record." });
    
    setIsProcessing(false);
    onComplete();
  };

  const handleDownloadPdf = async () => {
    if (!formRef.current) return;
    setIsProcessing(true);
    toast({title: "Generating PDF...", description: "Please wait a moment."});

    try {
        const canvas = await html2canvas(formRef.current, { scale: 2, useCORS: true, logging: false });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        const residentName = appState.residents.find(r => r.id === evalData.residentId)?.name || 'resident';
        const fileName = `EPA_${epa.id.replace(/\s/g, '_')}_${residentName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({variant: "destructive", title: "PDF Generation Failed", description: "There was an error creating the PDF."});
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        <div ref={formRef} className="p-1">
          <Card>
            <CardHeader>
              <CardTitle>Evaluation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Resident</Label>
                  <Select value={evalData.residentId} onValueChange={(val) => handleUpdate('residentId', val)} disabled={isResidentRequesting || !!evaluation.activityDescription}>
                    <SelectTrigger><SelectValue placeholder="Choose a resident..." /></SelectTrigger>
                    <SelectContent>
                      {appState.residents.filter(r => r.type === 'neuro').map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label>{isResidentRequesting ? 'Supervising Staff' : 'Clinical Activity'}</Label>
                  {isResidentRequesting ? (
                     <Select value={evalData.evaluatorId} onValueChange={(val) => handleUpdate('evaluatorId', val)}>
                        <SelectTrigger><SelectValue placeholder="Choose staff for this request..." /></SelectTrigger>
                        <SelectContent>
                          {staff.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                  ) : (
                    <Input 
                      placeholder="e.g., OR Case, Clinic..." 
                      value={evalData.activityDescription} 
                      onChange={(e) => handleUpdate('activityDescription', e.target.value)} 
                      disabled={!evalData.residentId}
                    />
                  )}
                </div>
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
          <Button variant="outline" className="w-full" onClick={handleDownloadPdf} disabled={isProcessing}>
              <Download className="mr-2 h-4 w-4" /> Export as PDF
          </Button>
          {isResidentRequesting ? (
              <Button className="w-full" onClick={handleRequest} disabled={isProcessing}>
                  {isProcessing ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send Request to Evaluator</>}
              </Button>
          ) : (
              <Button className="w-full" onClick={handleSubmit} disabled={isProcessing}>
                   {isProcessing ? 'Submitting...' : 'Submit Evaluation'}
              </Button>
          )}
        </CardFooter>
    </div>
  );
}
