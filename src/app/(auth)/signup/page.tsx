
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// This is a mock function to simulate adding a pending user to a global state.
// In a real app, this would be a server action calling a database.
const addPendingUserToMockState = (newUser: any) => {
  try {
    const key = 'mock_app_state';
    const existingState = JSON.parse(localStorage.getItem(key) || '{}');
    if (!existingState.pendingUsers) {
      existingState.pendingUsers = [];
    }
    existingState.pendingUsers.push(newUser);
    localStorage.setItem(key, JSON.stringify(existingState));
    return { success: true };
  } catch (error) {
    console.error("Failed to update mock state:", error);
    return { success: false, error: "Could not save to mock state." };
  }
};


export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [pgyLevel, setPgyLevel] = useState<number | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
        toast({ variant: 'destructive', title: 'Please select a role.' });
        return;
    }
    if (role === 'resident' && !pgyLevel) {
        toast({ variant: 'destructive', title: 'Please select a PGY level.' });
        return;
    }
    
    // In a real app, this would be a server action.
    // For now, we simulate adding to a "pendingUsers" list in localStorage.
    const newUser = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      role,
      pgyLevel: role === 'resident' ? pgyLevel : undefined,
      status: 'pending',
    };

    const result = addPendingUserToMockState(newUser);

    if (result.success) {
        setIsSubmitted(true);
        toast({
            title: "Sign-up Request Submitted",
            description: "Your request has been sent to the Program Director for approval."
        });
    } else {
        toast({ variant: 'destructive', title: 'Submission Failed', description: result.error });
    }
  };

  if (isSubmitted) {
    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Request Submitted</h2>
                <p className="text-muted-foreground mt-2">Your sign-up request has been sent for approval. You will be notified once the Program Director has reviewed it. You may now close this page.</p>
            </div>
            <div className="mt-6 text-center text-sm">
                <Link href="/login" className="underline font-medium hover:text-primary">
                Back to Login
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-muted-foreground">Enter your information to get started.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={setRole} required>
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="resident">Resident</SelectItem>
                </SelectContent>
            </Select>
        </div>
        
        {role === 'resident' && (
             <div className="space-y-2">
                <Label htmlFor="pgy-level">PGY Level</Label>
                <Select onValueChange={(val) => setPgyLevel(Number(val))} required>
                    <SelectTrigger id="pgy-level">
                        <SelectValue placeholder="Select PGY Level" />
                    </SelectTrigger>
                    <SelectContent>
                       {[1, 2, 3, 4, 5, 6].map(l => <SelectItem key={l} value={String(l)}>PGY-{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        )}

        <Button type="submit" className="w-full">
          Request Account
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="underline font-medium hover:text-primary">
          Login
        </Link>
      </div>
    </div>
  );
}

