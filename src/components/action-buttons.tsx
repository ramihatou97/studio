
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
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

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
          <Card className="w-full mt-6">
            <CardHeader><CardTitle>Schedule-Dependent AI Tools</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentUserRole === 'program-director' && appState.errors && appState.errors.length > 0 && (
                  <Button onClick={() => setOptimizerModalOpen(true)} variant="outline" className="border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700">
                      <Sparkles className="mr-2 h-4 w-4" /> AI Optimizer
                  </Button>
              )}
               <Button onClick={() => setSurgicalBriefingModalOpen(true)} variant="outline" className="border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700" disabled={!hasOrCases}>
                  <BrainCircuit className="mr-2 h-4 w-4" /> Surgical Briefing
              </Button>
              {currentUserRole === 'program-director' && (
                  <Button onClick={() => setAnalysisModalOpen(true)} variant="outline" className="border-purple-500/20 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700">
                  <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
                  </Button>
              )}
              {currentUserRole === 'program-director' && (
                  <Button onClick={() => setHandoverModalOpen(true)} variant="outline" className="border-sky-500/20 text-sky-600 hover:bg-sky-500/10 hover:text-sky-700">
                  <FileText className="mr-2 h-4 w-4" /> Handover Email
                  </Button>
              )}
              {currentUserRole === 'program-director' && (
                  <Button onClick={() => setLongTermAnalysisModalOpen(true)} variant="outline" className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700">
                  <BarChart className="mr-2 h-4 w-4" /> Long-Term Analysis
                  </Button>
              )}
              {currentUserRole === 'program-director' && (
                  <Button onClick={() => setChatModalOpen(true)} variant="outline" className="border-green-500/20 text-green-600 hover:bg-green-500/10 hover:text-green-700">
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat with AI
                  </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="w-full mt-6">
        <CardHeader><CardTitle>Strategic & Educational Tools</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentUserRole === 'program-director' && (
              <Button onClick={() => setYearlyRotationModalOpen(true)} variant="outline" className="h-24 border-orange-500/20 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 flex-col">
                  <CalendarDays className="h-6 w-6 mb-1"/>
                  <span className="font-semibold text-base">Yearly Rotation Planner</span>
              </Button>
            )}
            <Button onClick={() => setProcedureLogModalOpen(true)} variant="outline" className="h-24 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 flex-col">
              <BookUser className="h-6 w-6 mb-1" />
              <span className="font-semibold text-base">Procedure Log</span>
            </Button>
            <Button onClick={() => setEpaModalOpen(true)} variant="outline" className="h-24 border-teal-500/20 text-teal-600 hover:bg-teal-500/10 hover:text-teal-700 flex-col">
                <GraduationCap className="h-6 w-6 mb-1" />
                <span className="font-semibold text-base">Manage EPA Evaluations</span>
            </Button>
        </CardContent>
      </Card>
      
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
