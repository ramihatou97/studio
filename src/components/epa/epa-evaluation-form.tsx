
"use client";
import { useState, useRef, useMemo } from 'react';
import type { EPA, Milestone } from '@/lib/epa-data';
import type { AppState } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { StarRating } from './star-rating';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Download, Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface EpaEvaluationFormProps {
  epa: EPA;
  appState: AppState;
  onBack: () => void;
}

export function EpaEvaluationForm({ epa, appState }: EpaEvaluationFormProps) {
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [milestoneRatings, setMilestoneRatings] = useState<Record<number, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const residentActivities = useMemo(() => {
    if (!selectedResidentId) return [];
    
    const resident = appState.residents.find(r => r.id === selectedResidentId);
    if (!resident) return [];

    const activities: { label: string, value: string }[] = [];
    resident.schedule.forEach((dayActivities, dayIndex) => {
        const activity = dayActivities[0]; // Assuming one main activity per day for simplicity
        if (activity && activity !== 'Float' && activity !== 'Vacation' && activity !== 'Post-Call') {
            const dayDate = new Date(appState.general.startDate);
            dayDate.setDate(dayDate.getDate() + dayIndex);
            
            let label = `${dayDate.toISOString().split('T')[0]} - ${activity}`;
            
            if (activity === 'OR') {
                const cases = appState.orCases[dayIndex] || [];
                cases.forEach((c, i) => {
                   activities.push({
                       label: `${label}: ${c.procedure} w/ ${c.surgeon}`,
                       value: `or-${dayIndex}-${i}`
                   });
                });
            } else if (activity === 'Clinic') {
                 const clinics = appState.clinicAssignments.filter(c => c.day === dayIndex + 1);
                 clinics.forEach((c,i) => {
                    activities.push({
                        label: `${label}: ${c.clinicType} w/ ${c.staffName}`,
                        value: `clinic-${dayIndex}-${i}`
                    });
                 });
            } else {
                 activities.push({ label, value: `activity-${dayIndex}` });
            }
        }
    });
    return activities;
  }, [selectedResidentId, appState]);

  const handleRatingChange = (milestoneIndex: number, rating: number) => {
    setMilestoneRatings(prev => ({ ...prev, [milestoneIndex]: rating }));
  };
  
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

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Select Resident</Label>
              <Select value={selectedResidentId} onValueChange={setSelectedResidentId}>
                <SelectTrigger><SelectValue placeholder="Choose a resident..." /></SelectTrigger>
                <SelectContent>
                  {appState.residents.filter(r => r.type === 'neuro').map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Activity for Evaluation</Label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity} disabled={!selectedResidentId}>
                <SelectTrigger><SelectValue placeholder="Choose an activity..." /></SelectTrigger>
                <SelectContent>
                  {residentActivities.map(act => (
                    <SelectItem key={act.value} value={act.value}>{act.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScrollArea className="flex-1">
        <div ref={formRef} className="p-1">
          <Card>
            <CardHeader>
              <CardTitle>EPA Details: {epa.id}</CardTitle>
              <CardDescription>{epa.title}</CardDescription>
            </CardHeader>
            <CardContent>
                <h4 className="font-semibold mb-2">Key Features:</h4>
                <p className="text-sm text-muted-foreground">{epa.keyFeatures}</p>
                <h4 className="font-semibold mt-4 mb-2">Assessment Plan:</h4>
                <p className="text-sm text-muted-foreground">{epa.assessmentPlan}</p>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
             <CardHeader>
              <CardTitle>Milestone Evaluation</CardTitle>
              <CardDescription>Rate each milestone on a scale of 1 (low) to 5 (high).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {epa.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
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
                    {isDownloading ? 'Generating...' : <><Download className="mr-2 h-4 w-4" /> Export Evaluation as PDF</>}
                </Button>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
