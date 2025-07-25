
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { UserProfile } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'resident' | 'staff' | ''>('');
  const [pgyLevel, setPgyLevel] = useState<number | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
        toast({ variant: 'destructive', title: 'Please select a role.' });
        return;
    }
    if (role === 'resident' && !pgyLevel) {
        toast({ variant: 'destructive', title: 'Please select a PGY level.' });
        return;
    }
    
    setIsLoading(true);
    
    try {
        // Step 1: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Create a user profile document in Firestore
        const userProfile: UserProfile = {
            uid: user.uid,
            email: user.email!,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            role,
            status: 'pending', // All new users are pending approval
            pgyLevel: role === 'resident' ? pgyLevel : undefined,
        };

        await setDoc(doc(db, "users", user.uid), userProfile);

        setIsSubmitted(true);
        toast({
            title: "Sign-up Request Submitted",
            description: "Your request has been sent to the Program Director for approval."
        });

    } catch (error: any) {
        let errorMessage = 'An unknown error occurred.';
        if (error.code) {
            switch(error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already in use.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'The password is too weak. Please choose a stronger password.';
                    break;
                default:
                    errorMessage = 'An error occurred during sign up. Please try again.';
            }
        }
        toast({ variant: 'destructive', title: 'Sign-up Failed', description: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
        <div>
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Request Submitted</h2>
                <p className="text-muted-foreground mt-2">Your sign-up request has been sent for approval. You will be notified by email once the Program Director has reviewed it. You may now close this page.</p>
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
                <Input id="first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} disabled={isLoading} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} disabled={isLoading} />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
        </div>
        <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(v) => setRole(v as 'resident' | 'staff')} required disabled={isLoading}>
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
                <Select onValueChange={(val) => setPgyLevel(Number(val))} required disabled={isLoading}>
                    <SelectTrigger id="pgy-level">
                        <SelectValue placeholder="Select PGY Level" />
                    </SelectTrigger>
                    <SelectContent>
                       {[1, 2, 3, 4, 5, 6].map(l => <SelectItem key={l} value={String(l)}>PGY-{l}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
