import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateHandoverEmailAction } from '@/lib/actions';
import type { AppState, ScheduleOutput } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Bot, ClipboardCopy } from 'lucide-react';

interface HandoverModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
  scheduleOutput: ScheduleOutput;
}

export function HandoverModal({ isOpen, onOpenChange, appState, scheduleOutput }: HandoverModalProps) {
  const [emailContent, setEmailContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchEmail = async () => {
        setIsLoading(true);
        setEmailContent(null);
        const result = await generateHandoverEmailAction(appState, scheduleOutput);
        if (result.success) {
          setEmailContent(result.data);
        } else {
          setEmailContent(`Error generating email: ${result.error}`);
        }
        setIsLoading(false);
      };
      fetchEmail();
    }
  }, [isOpen, appState, scheduleOutput]);
  
  const handleCopy = () => {
    if (emailContent) {
      navigator.clipboard.writeText(emailContent);
      toast({ title: 'Copied to clipboard!' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI-Generated Handover Email</DialogTitle>
          <DialogDescription>
            A draft of the handover email has been generated based on the current schedule.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
             <div className="flex flex-col items-center justify-center h-48">
              <Bot className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Generating email...</p>
            </div>
          ) : (
            <>
              <Textarea
                readOnly
                value={emailContent || ''}
                className="h-64 text-sm"
              />
              <Button onClick={handleCopy} className="mt-4 w-full" disabled={!emailContent}>
                <ClipboardCopy className="mr-2 h-4 w-4" /> Copy to Clipboard
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
