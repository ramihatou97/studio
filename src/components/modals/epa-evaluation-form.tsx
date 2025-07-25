
"use client";
import { useState, useRef, useMemo, useEffect } from 'react';
import type { EPA, Milestone } from '@/lib/epa-data';
import type { AppState } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { StarRating } from '../epa/star-rating';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

interface EpaEvaluationFormProps {
  epa: EPA;
  appState: AppState;
  onBack: () => void;
  hasGenerated: boolean;
  prefilledResidentId?: string;
  prefilledActivityDescription?: string;
}

export function EpaEvaluationForm({ 
  epa, 
  appState, 
  onBack, 
  hasGenerated, 
  prefilledResidentId, 
  prefilledActivityDescription 
}: EpaEvaluationFormProps) {
  const [selectedResidentId, setSelectedResidentId] = useState(prefilledResidentId || '');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [manualActivity, setManualActivity] = useState(prefilledActivityDescription || '');
  const [milestoneRatings, setMilestoneRatings] = useState<Record<number, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentUser, staff } = appState;

  // Pre-select resident if the current user is a resident
  useEffect(() => {
    if (currentUser.role === 'resident') {
        setSelectedResidentId(currentUser.id);
    }
  }, [currentUser]);
  
  const handleDownloadPdf = async () => {
    if (!formRef.current) return;
    setIsDownloading(true);
    toast({title: "Generating PDF...", description: "Please wait a moment."});

    try {
        const canvas = await html2canvas(formRef.current, {
            scale: 2,
            useCORS: true,
            logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

        const residentName = appState.residents.find(r => r.id === selectedResidentId)?.name || 'resident';
        const fileName = `EPA_${epa.id.replace(/\s/g, '_')}_${residentName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        pdf.save(fileName);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({variant: "destructive", title: "PDF Generation Failed", description: "There was an error creating the PDF."});
    } finally {
        setIsDownloading(false);
    }
  };
  
  const isResidentRequesting = currentUser.role === 'resident';

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
                  <Label>{isResidentRequesting ? 'Resident (You)' : 'Select Resident'}</Label>
                  <Select value={selectedResidentId} onValueChange={setSelectedResidentId} disabled={isResidentRequesting || !!prefilledResidentId}>
                    <SelectTrigger><SelectValue placeholder="Choose a resident..." /></SelectTrigger>
                    <SelectContent>
                      {appState.residents.filter(r => r.type === 'neuro').map(r => (
                        <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                 <div>
                  <Label>{isResidentRequesting ? 'Select Supervising Staff' : 'Clinical Activity'}</Label>
                  {isResidentRequesting ? (
                     <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                        <SelectTrigger><SelectValue placeholder="Choose staff for this request..." /></SelectTrigger>
                        <SelectContent>
                          {staff.map(s => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                  ) : (
                    <Input 
                      placeholder="Manually describe activity (e.g., OR Case)..." 
                      value={manualActivity} 
                      onChange={(e) => setManualActivity(e.target.value)} 
                      disabled={!selectedResidentId}
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
              <CardDescription>Rate each milestone on a scale of 1 (low) to 5 (high).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {epa.milestones.map((milestone, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 rounded-lg bg-muted/50 gap-2">
                    <p className="flex-1 text-sm">{milestone.text}</p>
                    <StarRating rating={milestoneRatings[index] || 0} onRatingChange={(rating) => handleRatingChange(index, rating)} />
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
                    <StarRating rating={overallRating} onRatingChange={setOverallRating} />
                </div>
                <div>
                    <Label className="font-semibold">Narrative Feedback</Label>
                    <p className="text-xs text-muted-foreground mb-2">Provide specific comments on strengths and areas for improvement.</p>
                    <Textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={4} placeholder="Feedback..." />
                </div>
            </CardContent>
            <CardFooter>
                 <Button className="w-full" onClick={handleDownloadPdf} disabled={isDownloading}>
                    {isDownloading ? 'Generating...' : <><Download className="mr-2 h-4 w-4" /> {isResidentRequesting ? 'Generate & Export PDF Request' : 'Export Evaluation as PDF'}</>}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
