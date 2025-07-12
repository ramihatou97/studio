import type { AppState, OnServiceCallRule } from "@/lib/types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, PlusCircle } from "lucide-react";

interface OnServiceCallRulesProps {
  appState: AppState;
  setAppState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function OnServiceCallRules({ appState, setAppState }: OnServiceCallRulesProps) {
  const { onServiceCallRules } = appState;

  const updateRule = (index: number, field: keyof OnServiceCallRule, value: number) => {
    const newRules = [...onServiceCallRules];
    newRules[index] = { ...newRules[index], [field]: value };
    setAppState(prev => ({ ...prev, onServiceCallRules: newRules }));
  };

  const addRule = () => {
    const newRule: OnServiceCallRule = { minDays: 35, maxDays: 35, calls: 9 };
    setAppState(prev => ({ ...prev, onServiceCallRules: [...prev.onServiceCallRules, newRule] }));
  };
  
  const removeRule = (index: number) => {
    const newRules = onServiceCallRules.filter((_, i) => i !== index);
    setAppState(prev => ({ ...prev, onServiceCallRules: newRules }));
  };

  return (
    <AccordionItem value="call-rules">
      <AccordionTrigger className="text-lg font-medium">On-Service Call Rule Configuration</AccordionTrigger>
      <AccordionContent>
        <div className="w-full bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border dark:border-gray-700">
          <p className="text-sm text-muted-foreground mb-4">
            Set the maximum number of calls based on the number of days a resident is on service (Rotation Days - Vacation Days).
          </p>
          <div className="space-y-3">
            {onServiceCallRules.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input type="number" value={rule.minDays} onChange={e => updateRule(index, 'minDays', parseInt(e.target.value))} className="w-20" />
                <span>to</span>
                <Input type="number" value={rule.maxDays} onChange={e => updateRule(index, 'maxDays', parseInt(e.target.value))} className="w-20" />
                <span>days =</span>
                <Input type="number" value={rule.calls} onChange={e => updateRule(index, 'calls', parseInt(e.target.value))} className="w-20" />
                <span>calls</span>
                <Button variant="ghost" size="icon" onClick={() => removeRule(index)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button onClick={addRule} className="mt-4 w-full" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Rule</Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
