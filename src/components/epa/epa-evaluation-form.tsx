
"use client";
import { useState, useRef, useMemo, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { Input } from '../ui/input';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface EpaEvaluationFormProps {
  epa: EPA;
  appState: AppState;
  onBack: () => void;
}

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

const EpaPdfDocument = ({ epa, formState, appState }: { epa: EPA, formState: any, appState: AppState }) => {
    const resident = appState.residents.find(r => r.id === formState.residentId);
    const evaluator = appState.staff.find(s => s.id === formState.staffId);
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
                    <Text style={styles.label}>Activity</Text><Text style={styles.value}>{formState.activity}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Overall Assessment</Text>
                     <View style={styles.grid}>
                        <View style={styles.gridItem}><Text style={styles.label}>Overall Entrustment Score</Text><Text style={styles.value}>{formState.overallRating} / 5</Text></View>
                    </View>
                    <Text style={styles.label}>Narrative Feedback</Text>
                    <Text style={styles.feedback}>"{formState.feedback || 'No feedback provided.'}"</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Milestone Ratings</Text>
                    {epa.milestones.map((milestone, index) => (
                        <View key={index} style={styles.milestone}>
                            <Text style={styles.milestoneText}>{milestone.text}</Text>
                            <Text style={styles.rating}>{formState.milestoneRatings[index] || 'N/R'} / 5</Text>
                        </View>
                    ))}
                </View>
            </Page>
        </Document>
    )
};


export function EpaEvaluationForm({ epa, appState, onBack }: EpaEvaluationFormProps) {
  const [selectedResidentId, setSelectedResidentId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedActivity, setSelectedActivity] = useState('');
  const [manualActivity, setManualActivity] = useState('');
  const [milestoneRatings, setMilestoneRatings] = useState<Record<number, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  
  const { toast } = useToast();
  const { currentUser, staff, residents } = appState;
  const hasGenerated = residents.some(r => r.schedule.length > 0);

  // Pre-select resident if the current user is a resident
  useEffect(() => {
    if (currentUser.role === 'resident') {
        setSelectedResidentId(currentUser.id);
    }
  }, [currentUser]);

  const residentActivities = useMemo(() => {
    if (!selectedResidentId || !hasGenerated) return [];
    
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
  }, [selectedResidentId, appState, hasGenerated]);

  const handleRatingChange = (milestoneIndex: number, rating: number) => {
    setMilestoneRatings(prev => ({ ...prev, [milestoneIndex]: rating }));
  };
  
  const isResidentRequesting = currentUser.role === 'resident';

  const formStateForPdf = {
      residentId: selectedResidentId,
      staffId: selectedStaffId,
      activity: residentActivities.find(a => a.value === selectedActivity)?.label || manualActivity,
      milestoneRatings,
      overallRating,
      feedback
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>{isResidentRequesting ? 'Resident (You)' : 'Select Resident'}</Label>
              <Select value={selectedResidentId} onValueChange={setSelectedResidentId} disabled={isResidentRequesting}>
                <SelectTrigger><SelectValue placeholder="Choose a resident..." /></SelectTrigger>
                <SelectContent>
                  {appState.residents.filter(r => r.type === 'neuro').map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.name} (PGY-{r.level})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div>
              <Label>{isResidentRequesting ? 'Select Supervising Staff' : 'Select Activity for Evaluation'}</Label>
              {isResidentRequesting ? (
                 <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                    <SelectTrigger><SelectValue placeholder="Choose staff for this request..." /></SelectTrigger>
                    <SelectContent>
                      {staff.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              ) : (hasGenerated && residentActivities.length > 0) ? (
                <Select value={selectedActivity} onValueChange={setSelectedActivity} disabled={!selectedResidentId}>
                    <SelectTrigger><SelectValue placeholder="Choose a scheduled activity..." /></SelectTrigger>
                    <SelectContent>
                    {residentActivities.map(act => (
                        <SelectItem key={act.value} value={act.value}>{act.label}</SelectItem>
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

      <ScrollArea className="flex-1">
        <div className="p-1">
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
                 <PDFDownloadLink
                    document={<EpaPdfDocument epa={epa} formState={formStateForPdf} appState={appState} />}
                    fileName={`EPA_Evaluation_${residentActivities.find(a => a.value === selectedActivity)?.label || 'manual'}.pdf`}
                    className="w-full"
                  >
                  {({ blob, url, loading, error }) =>
                      <Button className="w-full" disabled={loading}>
                          {loading ? 'Generating...' : <><Download className="mr-2 h-4 w-4" /> {isResidentRequesting ? 'Generate & Export PDF Request' : 'Export Evaluation as PDF'}</>}
                      </Button>
                  }
                  </PDFDownloadLink>
            </CardFooter>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
