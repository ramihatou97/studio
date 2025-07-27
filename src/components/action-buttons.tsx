
import { useState, useRef, useMemo } from 'react';
import type { AppState, GenerationScope } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Sparkles, Wand2, FileDown, FileUp, MessageCircle, BarChart, BookUser, BrainCircuit, GraduationCap, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ActionButtonsProps {
  onGenerate: (scope: GenerationScope) => void;
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
  isLoading: boolean;
  hasGenerated: boolean;
  onEpaClick: () => void;
  onProcedureLogClick: () => void;
  onYearlyRotationClick: () => void;
  onAnalysisClick: () => void;
  onOptimizerClick: () => void;
  onHandoverClick: () => void;
  onChatClick: () => void;
  onLongTermAnalysisClick: () => void;
  onSurgicalBriefingClick: () => void;
}

export function ActionButtons({ 
    onGenerate, appState, setAppState, isLoading, hasGenerated,
    onEpaClick, onProcedureLogClick, onYearlyRotationClick,
    onAnalysisClick, onOptimizerClick, onHandoverClick, onChatClick, onLongTermAnalysisClick, onSurgicalBriefingClick
}: ActionButtonsProps) {
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isLoading} className="w-full md:w-1/2 text-lg py-6">
                      {isLoading ? (
                          <><Bot className="mr-2 h-5 w-5 animate-spin" /> Generating...</>
                      ) : (
                          <><Wand2 className="mr-2 h-5 w-5" /> {hasGenerated ? 'Re-generate Schedules' : 'Generate Schedules'}</>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full md:w-1/2">
                    <DropdownMenuItem onSelect={() => onGenerate({ type: 'all' })}>
                      Generate Full Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onGenerate({ type: 'week', weekNumber: 1 })}>
                      Generate Week 1 Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onGenerate({ type: 'week', weekNumber: 2 })}>
                      Generate Week 2 Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onGenerate({ type: 'week', weekNumber: 3 })}>
                      Generate Week 3 Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onGenerate({ type: 'week', weekNumber: 4 })}>
                      Generate Week 4 Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

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
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {currentUserRole === 'program-director' && appState.errors && appState.errors.length > 0 && (
                  <Button onClick={onOptimizerClick} variant="outline" className="border-amber-500/20 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700">
                      <Sparkles className="mr-2 h-4 w-4" /> AI Optimizer
                  </Button>
              )}
               <Button onClick={onSurgicalBriefingClick} variant="outline" className="border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10 hover:text-indigo-700" disabled={!hasOrCases}>
                  <BrainCircuit className="mr-2 h-4 w-4" /> Surgical Briefing
              </Button>
              {currentUserRole === 'program-director' && (
                  <Button onClick={onAnalysisClick} variant="outline" className="border-purple-500/20 text-purple-600 hover:bg-purple-500/10 hover:text-purple-700">
                  <Sparkles className="mr-2 h-4 w-4" /> AI Analysis
                  </Button>
              )}
              {currentUserRole === 'program-director' && (
                  <Button onClick={onHandoverClick} variant="outline" className="border-sky-500/20 text-sky-600 hover:bg-sky-500/10 hover:text-sky-700">
                  <FileText className="mr-2 h-4 w-4" /> Handover Email
                  </Button>
              )}
              {currentUserRole === 'program-director' && (
                  <Button onClick={onLongTermAnalysisClick} variant="outline" className="border-blue-500/20 text-blue-600 hover:bg-blue-500/10 hover:text-blue-700">
                  <BarChart className="mr-2 h-4 w-4" /> Long-Term Analysis
                  </Button>
              )}
              <Button onClick={onChatClick} variant="outline" className="border-green-500/20 text-green-600 hover:bg-green-500/10 hover:text-green-700">
                  <MessageCircle className="mr-2 h-4 w-4" /> Chat with AI
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="w-full mt-6">
        <CardHeader><CardTitle>Strategic & Educational Tools</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentUserRole === 'program-director' && (
              <Button onClick={onYearlyRotationClick} variant="outline" className="h-24 border-orange-500/20 text-orange-600 hover:bg-orange-500/10 hover:text-orange-700 flex-col">
                  <CalendarDays className="h-6 w-6 mb-1"/>
                  <span className="font-semibold text-base">Yearly Rotation Planner</span>
              </Button>
            )}
            <Button onClick={onProcedureLogClick} variant="outline" className="h-24 border-rose-500/20 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 flex-col">
              <BookUser className="h-6 w-6 mb-1" />
              <span className="font-semibold text-base">Procedure Log</span>
            </Button>
            <Button onClick={onEpaClick} variant="outline" className="h-24 border-teal-500/20 text-teal-600 hover:bg-teal-500/10 hover:text-teal-700 flex-col">
                <GraduationCap className="h-6 w-6 mb-1" />
                <span className="font-semibold text-base">EPA Dashboard</span>
            </Button>
        </CardContent>
      </Card>
    </>
  );
}
