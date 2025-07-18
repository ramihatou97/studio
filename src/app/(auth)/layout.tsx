
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MediShiftLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, KeyRound } from 'lucide-react';
import type { UserRole } from '@/lib/types';

// This is a mock function to simulate "logging in" by updating the global state.
// In a real app, this would involve server-side authentication.
const updateUserInMockState = (foundUser: { role: UserRole, id: string, name: string }) => {
  try {
    // We only update the currentUser part of the state
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true };
  } catch (error) {
    console.error("Failed to update mock state:", error);
    return { success: false, error: "Could not save to mock state." };
  }
};


function MasterAccessModal() {
    const [pin, setPin] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const MASTER_PIN = '4594';

    const handleAccess = () => {
        if (pin === MASTER_PIN) {
            const masterUser = { role: 'program-director' as UserRole, id: 'program-director', name: 'Program Director' };
            const result = updateUserInMockState(masterUser);
            if (result.success) {
                toast({ title: 'Master Access Granted', description: 'Welcome, Creator.' });
                router.push('/app');
                setIsOpen(false);
            } else {
                toast({ variant: 'destructive', title: 'Access Failed', description: result.error });
            }
        } else {
            toast({ variant: 'destructive', title: 'Incorrect PIN', description: 'The entered PIN is incorrect.' });
        }
        setPin('');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="absolute bottom-4 right-4 text-muted-foreground/50 hover:text-primary">
                    <Shield className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><KeyRound/> Master Access</DialogTitle>
                    <DialogDescription>
                        Enter the master PIN to gain administrator access.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                     <div className="space-y-2">
                        <Label htmlFor="pin">PIN</Label>
                        <Input 
                            id="pin" 
                            type="password" 
                            maxLength={4} 
                            value={pin} 
                            onChange={(e) => setPin(e.target.value)} 
                            onKeyDown={(e) => e.key === 'Enter' && handleAccess()}
                            placeholder="****"
                        />
                    </div>
                    <Button onClick={handleAccess} className="w-full">Grant Access</Button>
                </div>
                 <p className="text-xs text-muted-foreground text-center pt-2">
                    Forgot PIN? Contact the owner at ramihatoum00@gmail.com for recovery.
                </p>
            </DialogContent>
        </Dialog>
    )
}


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="w-full max-w-md relative">
        <div className="flex justify-center items-center gap-4 mb-8">
            <MediShiftLogo className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                MediShift
              </h1>
              <p className="text-muted-foreground mt-1">
                AI Neurosurgery Resident Scheduler
              </p>
            </div>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-lg">
            {children}
        </div>
        <MasterAccessModal />
       </div>
    </div>
  );
}
