
"use client";
import { useState } from 'react';
import type { EPA } from '@/lib/epa-data';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface EpaListProps {
  epas: EPA[];
  onSelectEpa: (epa: EPA) => void;
}

export function EpaList({ epas, onSelectEpa }: EpaListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEpas = epas.filter(epa =>
    epa.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    epa.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (epa.stage && epa.stage.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-1">
        <Input
          type="text"
          placeholder="Search EPAs by name, ID, or stage (e.g., 'Core', 'Foundations')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>
      <ScrollArea className="flex-1 mt-2 border rounded-lg">
        <div className="p-4 space-y-3">
          {filteredEpas.map(epa => (
            <div key={epa.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div>
                <h3 className="font-semibold text-lg">{epa.id}: {epa.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{epa.keyFeatures}</p>
                 <div className="mt-2 flex gap-2">
                    {epa.stage && <Badge variant="secondary">{epa.stage}</Badge>}
                    {epa.type && <Badge variant="outline">{epa.type}</Badge>}
                 </div>
              </div>
              <Button onClick={() => onSelectEpa(epa)}>Evaluate</Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
