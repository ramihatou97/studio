import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatWithScheduleAction } from '@/lib/actions';
import type { AppState } from '@/lib/types';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  appState: AppState;
}

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function ChatModal({ isOpen, onOpenChange, appState }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await chatWithScheduleAction({
            appState,
            history: messages,
            question: input,
        });

        if (result.success && result.data) {
            const modelMessage: Message = { role: 'model', parts: [{ text: result.data }] };
            setMessages(prev => [...prev, modelMessage]);
        } else {
            const errorMessage: Message = { role: 'model', parts: [{ text: `Error: ${result.error}` }] };
            setMessages(prev => [...prev, errorMessage]);
        }
    } catch (error) {
        const errorMessage: Message = { role: 'model', parts: [{ text: 'An unexpected error occurred.' }] };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
            setMessages([]);
        }
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chat with AI Assistant</DialogTitle>
          <DialogDescription>
            Ask questions about the schedule. Try "Who is on spine call tomorrow?" or "What are Dr. Andrew's cases on day 3?"
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                {messages.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {message.role === 'model' && <div className="p-2 rounded-full bg-primary/10 text-primary"><Bot className="w-5 h-5" /></div>}
                        <div className={cn("max-w-md rounded-lg p-3 text-sm", message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            {message.parts.map((part, i) => <p key={i} className="whitespace-pre-wrap">{part.text}</p>)}
                        </div>
                        {message.role === 'user' && <div className="p-2 rounded-full bg-muted"><User className="w-5 h-5" /></div>}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="p-2 rounded-full bg-primary/10 text-primary"><Bot className="w-5 h-5" /></div>
                        <div className="max-w-md rounded-lg p-3 bg-muted flex items-center">
                            <Loader2 className="w-5 h-5 animate-spin" />
                        </div>
                    </div>
                )}
                </div>
            </ScrollArea>
        </div>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
            autoComplete="off"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
