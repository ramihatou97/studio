import { useState, useRef } from 'react';
import type { AppState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AnalysisModal } from './modals/analysis-modal';
import { HandoverModal } from './modals/handover-modal';
import { OptimizerModal } from './modals/optimizer-modal';
import { Bot, FileText, Sparkles, Wand2, FileDown, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActionButtonsProps {
  onGenerate: () => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  isLoading: boolean;
  hasGenerated: boolean;
}

export function ActionButtons({ onGenerate, appState, setAppState, isLoading, hasGenerated }: ActionButtonsProps) {
  const [isAnalysisModalOpen, setAnalysisModalOpen] = useState(false);
  const [isOptimizerModalOpen, setOptimizerModalOpen] = useState(false);
  const [isHandoverModalOpen, setHandoverModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSave = () => {
    try {
      const stateString = JSON.stringify(appState, null, 2);
      const blob = new Blob([stateString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medishift-config.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Configuration Saved", description: "Your settings have been saved to medishift-config.json." });
    } catch (error) {
      toast({ variant: 'destructive', title: "Save Failed", description: "Could not save the configuration file." });
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const loadedState = JSON.parse(text);
          // Basic validation to ensure it's a valid state file
          if (loadedState.general && loadedState.residents) {
            setAppState(loadedState);
            toast({ title: "Configuration Loaded", description: "Your settings have been successfully restored." });
          } else {
            throw new Error("Invalid configuration file format.");
          }
        }
      } catch (error) {
        toast({ variant: 'destructive', title: "Load Failed", description: "The selected file is not a valid configuration." });
      }
    };
    reader.readAsText(file);
    // Reset file input value to allow loading the same file again
    event.target.value = '';
  };
  
  return (
    <>
      <div className="my-8 flex flex-col items-center space-y-4">
        <Button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full md:w-1/2 text-lg py-6"
        >
          {isLoading ? (
            <><Bot className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
          ) : (
            <><Wand2 className="mr-2 h-5 w-5" /> {hasGenerated ? 'Re-generate Schedules' : 'Generate Schedules'}</>
          )}
        </Button>
        <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button onClick={handleSave} variant="outline">
                <FileDown className="mr-2 h-4 w-4" /> Save Config
            </Button>
            <Button onClick={handleLoadClick} variant="outline">
                <FileUp className="mr-2 h-4 w-4" /> Load Config
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
        </div>
        {hasGenerated && (
          <div className="w-full md:w-1/2 grid grid-cols-1 md:grid-cols-3 gap-2">
            {appState.errors && appState.errors.length > 0 && (
                <Button onClick={() => setOptimizerModalOpen(true)} variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
                    <Sparkles className="mr-2 h-4 w-4" /> AI Optimizer
                </Button>
            )}
            <Button onClick={() => setAnalysisModalOpen(true)} variant="outline" className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20">
              <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
            </Button>
            <Button onClick={() => setHandoverModalOpen(true)} variant="outline" className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-sky-500/20 col-span-1 md:col-span-2">
              <FileText className="mr-2 h-4 w-4" /> Generate Handover Email
            </Button>
          </div>
        )}
      </div>

      {hasGenerated && (
        <>
          <AnalysisModal
            isOpen={isAnalysisModalOpen}
            onOpenChange={setAnalysisModalOpen}
            appState={appState}
          />
          <HandoverModal
            isOpen={isHandoverModalOpen}
            onOpenChange={setHandoverModalOpen}
            appState={appState}
          />
          <OptimizerModal
            isOpen={isOptimizerModalOpen}
            onOpenChange={setOptimizerModalOpen}
            appState={appState}
            setAppState={setAppState}
          />
        </>
      )}
    </>
  );
}
