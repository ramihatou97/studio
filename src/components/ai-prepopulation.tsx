import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { prepopulateDataAction } from "@/ai/actions";
import type { AppState, Resident } from "@/lib/types";
import { Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AiPrepopulationProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function AiPrepopulation({ appState, setAppState }: AiPrepopulationProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleParse = async () => {
    setIsLoading(true);
    let sourceType: 'text' | 'image' | null = null;
    let sourceData: string | null = null;

    if (file) {
      sourceType = 'image';
      sourceData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } else if (text.trim()) {
      sourceType = 'text';
      sourceData = text;
    }

    if (!sourceType || !sourceData) {
      toast({ variant: 'destructive', title: 'No data provided', description: 'Please upload an image or paste text to parse.' });
      setIsLoading(false);
      return;
    }

    const result = await prepopulateDataAction(sourceType, sourceData);

    if (result.success && result.data) {
      const existingResidentNames = new Set(appState.residents.map(r => r.name.toLowerCase()));
      const newResidents: Resident[] = [];
      
      result.data.residents.forEach(r => {
        if (!existingResidentNames.has(r.name.toLowerCase())) {
           newResidents.push({
            id: uuidv4(),
            type: 'neuro',
            name: r.name,
            level: r.level,
            onService: r.onService,
            vacationDays: r.vacationDays,
            isChief: false,
            chiefOrDays: [],
            maxOnServiceCalls: 0,
            offServiceMaxCall: 4,
            schedule: [],
            weekendCalls: 0,
            callDays: [],
            holidayGroup: 'neither',
            canBeBackup: false,
            allowSoloPgy1Call: false,
            doubleCallDays: 0,
            orDays: 0,
          });
        }
      });

      if (newResidents.length > 0) {
        setAppState(prev => ({
          ...prev,
          residents: [...prev.residents, ...newResidents]
        }));
        toast({ title: 'Success', description: `${newResidents.length} new residents have been populated from the source.` });
      } else {
        toast({ title: 'No new residents added', description: 'All residents from the source already exist in the configuration.' });
      }

    } else {
      toast({ variant: 'destructive', title: 'Parsing Failed', description: result.error });
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
      <h3 className="text-lg font-medium mb-2 text-purple-800 dark:text-purple-300 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        AI-Powered Pre-population
      </h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload an image or paste the text of an existing schedule to have the AI extract and populate resident data. Duplicates will be ignored.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schedule-image-upload">Upload Schedule Image</Label>
          <Input id="schedule-image-upload" type="file" accept="image/*" onChange={handleFileChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="schedule-text-paste">Or Paste Schedule Text</Label>
          <Textarea
            id="schedule-text-paste"
            rows={3}
            className="mt-1"
            placeholder="Paste call schedule, resident list, or vacation schedule here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleParse} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Parsing...' : 'Parse and Populate Form'}
        </Button>
      </div>
    </div>
  );
}
