
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { prepopulateDataAction } from "@/ai/actions";
import type { AppState, Resident, Staff } from "@/lib/types";
import { Sparkles } from 'lucide-react';

interface AiPrepopulationProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  onDataParsed: (data: any) => void;
  dataType: 'roster' | 'on-call' | 'or-clinic' | 'academic';
  title: string;
  description: string;
}

export function AiPrepopulation({ appState, setAppState, onDataParsed, dataType, title, description }: AiPrepopulationProps) {
  const [instructions, setInstructions] = useState('');
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
    const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
  
  const handleParse = async () => {
    setIsLoading(true);
    let sourceType: 'text' | 'image' | null = 'image';
    let sourceData: string | null = null;
    let textInstructions = instructions;

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
            // Use the extracted text as instructions if none are provided
            if (!textInstructions) textInstructions = sourceData;
        } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            sourceType = 'text';
            sourceData = await parseDocx(file);
             // Use the extracted text as instructions if none are provided
            if (!textInstructions) textInstructions = sourceData;
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

        const result = await prepopulateDataAction(sourceType, sourceData, textInstructions, context);

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
      <div className="space-y-4">
        <div>
          <Label htmlFor={`file-upload-${dataType}`}>Upload Roster/Schedule File</Label>
          <Input id={`file-upload-${dataType}`} type="file" accept="image/*,.pdf,.docx" onChange={handleFileChange} className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`instructions-${dataType}`}>Or Paste Instructions/Text</Label>
          <Textarea
            id={`instructions-${dataType}`}
            rows={3}
            className="mt-1"
            placeholder="Provide specific instructions for the AI, or paste the text directly here..."
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleParse} disabled={isLoading} className="bg-primary hover:bg-primary/90">
          {isLoading ? 'Parsing...' : 'Upload and Parse'}
        </Button>
      </div>
    </div>
  );
}
