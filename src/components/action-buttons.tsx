
import { useState, useRef, useMemo } from 'react';
import type { AppState } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { AnalysisModal } from './modals/analysis-modal';
import { HandoverModal } from './modals/handover-modal';
import { OptimizerModal } from './modals/optimizer-modal';
import { ChatModal } from './modals/chat-modal';
import { LongTermAnalysisModal } from './modals/long-term-analysis-modal';
import { ProcedureLogModal } from './modals/procedure-log-modal';
import { SurgicalBriefingModal } from './modals/surgical-briefing-modal';
import { EpaModal } from './modals/epa-modal';
import { YearlyRotationModal } from './modals/yearly-rotation-modal';
import { Bot, FileText, Sparkles, Wand2, FileDown, FileUp, MessageCircle, BarChart, BookUser, BrainCircuit, GraduationCap, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

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
  const [isChatModalOpen, setChatModalOpen] = useState(false);
  const [isLongTermAnalysisModalOpen, setLongTermAnalysisModalOpen] = useState(false);
  const [isProcedureLogModalOpen, setProcedureLogModalOpen] = useState(false);
  const [isSurgicalBriefingModalOpen, setSurgicalBriefingModalOpen] = useState(false);
  const [isEpaModalOpen, setEpaModalOpen] = useState(false);
  const [isYearlyRotationModalOpen, setYearlyRotationModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentUserRole = appState.currentUser.role;
  
  const hasOrCases = useMemo(() => {
    return Object.values(appState.orCases).some(dayCases => dayCases.length > 0);
  }, [appState.orCases]);

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
        {currentUserRole === 'program-director' && (
            <>
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
            </>
        )}
        
        {hasGenerated && (
          <div className="w-full md:w-3/4 lg:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4 pt-4 border-t">
            <h3 className="col-span-full text-center font-semibold text-lg mb-2">Schedule-Dependent AI Tools</h3>
            {currentUserRole === 'program-director' && appState.errors && appState.errors.length > 0 && (
                <Button onClick={() => setOptimizerModalOpen(true)} variant="outline" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20">
                    <Sparkles className="mr-2 h-4 w-4" /> AI Optimizer
                </Button>
            )}
             <Button onClick={() => setSurgicalBriefingModalOpen(true)} variant="outline" className="bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-500/20" disabled={!hasOrCases}>
                <BrainCircuit className="mr-2 h-4 w-4" /> Surgical Briefing
            </Button>
            {currentUserRole === 'program-director' && (
                <Button onClick={() => setAnalysisModalOpen(true)} variant="outline" className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20">
                <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
                </Button>
            )}
            {currentUserRole === 'program-director' && (
                <Button onClick={() => setHandoverModalOpen(true)} variant="outline" className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-sky-500/20">
                <FileText className="mr-2 h-4 w-4" /> Handover Email
                </Button>
            )}
            {currentUserRole === 'program-director' && (
                <Button onClick={() => setLongTermAnalysisModalOpen(true)} variant="outline" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20">
                <BarChart className="mr-2 h-4 w-4" /> Long-Term Analysis
                </Button>
            )}
            {currentUserRole === 'program-director' && (
                <Button onClick={() => setChatModalOpen(true)} variant="outline" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20">
                    <MessageCircle className="mr-2 h-4 w-4" /> Chat with AI
                </Button>
            )}
          </div>
        )}
      </div>

      <Separator className="my-8" />
      
      <div className="flex flex-col items-center space-y-4">
        <h3 className="text-center font-semibold text-lg mb-2">Strategic & Educational Tools</h3>
        <div className="w-full md:w-3/4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentUserRole === 'program-director' && (
              <Button onClick={() => setYearlyRotationModalOpen(true)} variant="outline" className="h-20 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-500/20 flex-col">
                  <CalendarDays className="h-6 w-6 mb-1"/>
                  <span className="font-semibold">Yearly Rotation Planner</span>
              </Button>
            )}
            <Button onClick={() => setProcedureLogModalOpen(true)} variant="outline" className="h-20 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/20 flex-col">
              <BookUser className="h-6 w-6 mb-1" />
              <span className="font-semibold">Procedure Log</span>
            </Button>
            <Button onClick={() => setEpaModalOpen(true)} variant="outline" className="h-20 bg-teal-500/10 text-teal-600 hover:bg-teal-500/20 border-teal-500/20 flex-col">
                <GraduationCap className="h-6 w-6 mb-1" />
                <span className="font-semibold">Manage EPA Evaluations</span>
            </Button>
        </div>
      </div>
      
      <YearlyRotationModal
        isOpen={isYearlyRotationModalOpen}
        onOpenChange={setYearlyRotationModalOpen}
        appState={appState}
        setAppState={setAppState}
       />
      <EpaModal
        isOpen={isEpaModalOpen}
        onOpenChange={setEpaModalOpen}
        appState={appState}
      />
      <ProcedureLogModal
        isOpen={isProcedureLogModalOpen}
        onOpenChange={setProcedureLogModalOpen}
        appState={appState}
        setAppState={setAppState}
      />
      
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
          <ChatModal
            isOpen={isChatModalOpen}
            onOpenChange={setChatModalOpen}
            appState={appState}
          />
          <LongTermAnalysisModal
            isOpen={isLongTermAnalysisModalOpen}
            onOpenChange={setLongTermAnalysisModalOpen}
            appState={appState}
          />
          <SurgicalBriefingModal
            isOpen={isSurgicalBriefingModalOpen}
            onOpenChange={setSurgicalBriefingModalOpen}
            appState={appState}
          />
        </>
      )}
    </>
  );
}
