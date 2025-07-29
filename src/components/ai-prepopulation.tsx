
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { prepopulateDataAction } from "@/ai/actions";
import type { AppState, Resident, Staff } from "@/lib/types";
import { Sparkles, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { getMonth, getYear } from 'date-fns';
import { differenceInDays } from 'date-fns';
import { calculateNumberOfDays } from '@/lib/utils';


interface AiPrepopulationProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  dataType: 'roster' | 'on-call' | 'or-clinic' | 'academic';
  title: string;
  description: string;
}

export function AiPrepopulation({ appState, setAppState, dataType, title, description }: AiPrepopulationProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const parsePdf = async (file: File): Promise<string> => {
    const pdfjs = await import('pdfjs-dist/build/pdf');
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ');
    }
    return fullText;
  };
  
  const parseDocx = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const onDataParsed = (data: any) => {
    setAppState(prev => {
        if (!prev) return null;

        let finalState = { ...prev };
        let toastMessage = '';

        // Roster parsing logic
        if (dataType === 'roster' && (data.newResidents || data.vacationDays)) {
            let updatedResidents = [...prev.residents];
            const existingNames = new Set(updatedResidents.map(r => r.name.toLowerCase()));
            let addedCount = 0;
            let vacationCount = 0;

            if (data.newResidents) {
                data.newResidents.forEach((res: any) => {
                    const trimmedName = res.name.trim();
                    if (!existingNames.has(trimmedName.toLowerCase())) {
                        addedCount++;
                        existingNames.add(trimmedName.toLowerCase());
                        const isNeuro = !res.specialty || res.specialty.toLowerCase().includes('neuro');
                        updatedResidents.push({
                            id: uuidv4(),
                            type: isNeuro ? 'neuro' : 'non-neuro',
                            name: trimmedName,
                            email: `${trimmedName.toLowerCase().replace(/\s/g, '.')}@medishift.com`,
                            level: res.level,
                            onService: res.onService,
                            specialty: isNeuro ? undefined : res.specialty,
                            vacationDays: [],
                            isChief: false,
                            chiefTakesCall: true,
                            chiefOrDays: [],
                            maxOnServiceCalls: 0,
                            offServiceMaxCall: 4,
                            schedule: [],
                            weekendCalls: 0,
                            callDays: [],
                            doubleCallDays: 0,
                            orDays: 0,
                            holidayGroup: 'neither',
                            allowSoloPgy1Call: false,
                            canBeBackup: false,
                        });
                    }
                });
            }
            
            if (data.vacationDays) {
                data.vacationDays.forEach((vacationInfo: { residentName: string; days: number[] }) => {
                    const residentIndex = updatedResidents.findIndex(r => r.name === vacationInfo.residentName);
                    if (residentIndex > -1) {
                        vacationCount++;
                        updatedResidents[residentIndex].vacationDays = vacationInfo.days;
                    }
                });
            }
            
            if (addedCount > 0 || vacationCount > 0) {
                toastMessage = `Added ${addedCount} new residents and updated ${vacationCount} vacation schedules.`;
            } else if (!data.newResidents && !data.vacationDays) {
                toastMessage = 'No usable data found. The AI could not extract resident or vacation information.';
            }
            else {
                 toastMessage = 'No new residents added. All residents from the source already exist.';
            }
            finalState = { ...finalState, residents: updatedResidents };
        }
        
        // On-Call parsing logic
        if (dataType === 'on-call' && (data.staffCall || data.residentCall)) {
            let newStaffCall = [...prev.staffCall];
            let newResidentCall = [...prev.residentCall];
            let staffCount = 0;
            let residentCount = 0;
            if (data.staffCall) {
                data.staffCall.forEach((call: any) => {
                    const dayIndex = call.day - 1;
                    staffCount++;
                    newStaffCall = newStaffCall.filter(c => !(c.day === (dayIndex + 1) && c.callType === call.callType));
                    newStaffCall.push({ day: dayIndex + 1, callType: call.callType, staffName: call.staffName });
                });
            }
            if (data.residentCall) {
                data.residentCall.forEach((call: any) => {
                    const dayIndex = call.day - 1;
                    const resident = prev.residents.find(r => r.name === call.residentName);
                    if (resident) {
                        residentCount++;
                        const callType = call.callType;
                        if (callType) {
                           newResidentCall = newResidentCall.filter(c => !(c.day === (dayIndex + 1) && c.residentId === resident.id));
                           newResidentCall.push({ day: dayIndex + 1, callType, residentId: resident.id });
                        }
                    }
                });
            }
            toastMessage = `Populated ${staffCount} staff and ${residentCount} resident call assignments.`;
            finalState = { ...finalState, staffCall: newStaffCall, residentCall: newResidentCall };
        }

        // OR/Clinic parsing logic
        if (dataType === 'or-clinic' && (data.orCases || data.clinicAssignments)) {
            const numberOfDays = calculateNumberOfDays(prev.general.startDate, prev.general.endDate);
            const newOrCases = { ...prev.orCases };
            const newClinicAssignments = [...prev.clinicAssignments];
            const rotationStartDate = new Date(prev.general.startDate);
            const rotationYear = getYear(rotationStartDate);
            
            if (data.orCases) {
                data.orCases.forEach((caseItem: any) => {
                    const day = caseItem.day;
                    const month = getMonth(new Date(caseItem.date || rotationStartDate));
                    const date = new Date(rotationYear, month, day);
                    const dayIndex = differenceInDays(date, rotationStartDate);

                    if (dayIndex >= 0 && dayIndex < numberOfDays) {
                        if (!newOrCases[dayIndex]) newOrCases[dayIndex] = [];
                        newOrCases[dayIndex].push({
                            surgeon: caseItem.surgeon,
                            diagnosis: caseItem.diagnosis,
                            procedure: caseItem.procedure,
                            procedureCode: caseItem.procedureCode || '',
                            complexity: 'routine',
                            patientMrn: caseItem.patientMrn,
                            patientSex: caseItem.patientSex,
                            age: caseItem.age,
                        });
                    }
                });
            }

            if (data.clinicAssignments) {
                data.clinicAssignments.forEach((clinicItem: any) => {
                     const day = clinicItem.day;
                    const month = getMonth(new Date(clinicItem.date || rotationStartDate));
                    const date = new Date(rotationYear, month, day);
                    const dayIndex = differenceInDays(date, rotationStartDate);

                    if (dayIndex >= 0 && dayIndex < numberOfDays) {
                         newClinicAssignments.push({
                            day: dayIndex + 1,
                            staffName: clinicItem.staffName,
                            clinicType: clinicItem.clinicType,
                            appointments: clinicItem.appointments || 10,
                            virtualAppointments: 0,
                        });
                    }
                });
            }
            toastMessage = 'Populated OR and Clinic data.';
            finalState = { ...finalState, orCases: newOrCases, clinicAssignments: newClinicAssignments };
        }

        // Academic event parsing logic
        if (dataType === 'academic' && data.academicEvents?.length > 0) {
            const numberOfDays = calculateNumberOfDays(prev.general.startDate, prev.general.endDate);
            const newCaseRounds = [...prev.caseRounds];
            const newArticleDiscussions = [...prev.articleDiscussions];
            let count = 0;
            data.academicEvents.forEach((event: any) => {
                const dayIndex = event.day - 1;
                if (dayIndex >= 0 && dayIndex < numberOfDays) {
                  count++;
                  if (event.eventType === 'Case Rounds') {
                    const resident = prev.residents.find(r => r.name === event.presenter);
                    if (resident) {
                      newCaseRounds.push({ dayIndex, residentId: resident.id });
                    }
                  } else if (event.eventType === 'Journal Club') {
                    const staffMember = prev.staff.find(s => s.name === event.presenter);
                    if (staffMember) {
                      newArticleDiscussions.push({
                        dayIndex,
                        staffId: staffMember.id,
                        article1: 'TBD from upload',
                        article2: 'TBD from upload',
                      });
                    }
                  }
                }
            });
            toastMessage = `Populated ${count} academic events.`;
            finalState = { ...finalState, caseRounds: newCaseRounds, articleDiscussions: newArticleDiscussions };
        }

        if (toastMessage) {
            toast({ title: 'AI Prepopulation', description: toastMessage });
        }

        return finalState;
    });
  };
  
  const handleParse = async () => {
    setIsLoading(true);
    let sourceType: 'text' | 'image' | null = null;
    let sourceData: string | null = null;
    
    // Generate instructions based on the data type context
    let instructions = '';
    switch (dataType) {
        case 'roster':
            instructions = 'This is the team roster. Extract all resident names, PGY levels, on-service status, and vacation schedules.';
            break;
        case 'on-call':
            instructions = 'This is the on-call schedule. Extract all staff and resident on-call assignments for each day.';
            break;
        case 'or-clinic':
            instructions = 'This is the OR and Clinic schedule. Extract all OR cases and clinic assignments.';
            break;
        case 'academic':
            instructions = 'This is the academic schedule. Extract all Case Rounds and Journal Club presentations.';
            break;
    }


    try {
        if (!file) {
            toast({ variant: 'destructive', title: 'No file uploaded', description: 'Please upload a file to parse.' });
            setIsLoading(false);
            return;
        }

        if (file.type.startsWith('image/')) {
            sourceType = 'image';
            sourceData = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } else if (file.type === 'application/pdf') {
            sourceType = 'text';
            sourceData = await parsePdf(file);
        } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            sourceType = 'text';
            sourceData = await parseDocx(file);
        } else {
            toast({ variant: 'destructive', title: 'Unsupported File Type', description: 'Please upload an image, PDF, or .docx file.' });
            setIsLoading(false);
            return;
        }

        const context = {
            residents: appState.residents.map(r => ({ name: r.name, id: r.id })),
            staff: appState.staff.map(s => ({ name: s.name, id: s.id })),
            startDate: appState.general.startDate,
        };

        const result = await prepopulateDataAction(sourceType, sourceData, instructions, context);

        if (result.success && result.data) {
          onDataParsed(result.data);
        } else {
          toast({ variant: 'destructive', title: 'Parsing Failed', description: result.error });
        }
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'File Processing Error', description: 'Could not read or parse the uploaded file.' });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
      <h3 className="text-lg font-medium mb-2 text-purple-800 dark:text-purple-300 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        {description}
      </p>
      <div className="space-y-2">
        <div>
          <Label htmlFor={`file-upload-${dataType}`}>Upload Roster/Schedule File</Label>
          <Input id={`file-upload-${dataType}`} type="file" accept="image/*,.pdf,.docx" onChange={handleFileChange} className="mt-1" />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleParse} disabled={isLoading || !file} className="bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            'Upload and Parse'
          )}
        </Button>
      </div>
    </div>
  );
}

    