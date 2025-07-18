
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import type { AppState, Resident, Staff, UserRole } from '@/lib/types';

// This is a mock function to simulate "logging in" by updating the global state.
// In a real app, this would involve server-side authentication.
const updateUserInMockState = (foundUser: { role: UserRole, id: string, name: string }) => {
  try {
    const key = 'mock_app_state';
    // We only update the currentUser part of the state
    localStorage.setItem('currentUser', JSON.stringify(foundUser));
    return { success: true };
  } catch (error) {
    console.error("Failed to update mock state:", error);
    return { success: false, error: "Could not save to mock state." };
  }
};

const findUserInMockState = (email: string): { role: UserRole, id: string, name: string } | null => {
    try {
        const key = 'mock_app_state';
        const storedStateJSON = localStorage.getItem(key);
        if (!storedStateJSON) return null;
        
        const state: AppState = JSON.parse(storedStateJSON);

        // Check program director (hardcoded)
        if (email === 'pd@medishift.com') {
            return { role: 'program-director', id: 'program-director', name: 'Program Director' };
        }

        // Check staff
        const staffUser = state.staff.find((s: Staff) => s.email === email);
        if (staffUser) {
            return { role: 'staff', id: staffUser.id, name: staffUser.name };
        }

        // Check residents
        const residentUser = state.residents.find((r: Resident) => r.email === email);
        if (residentUser) {
            return { role: 'resident', id: residentUser.id, name: residentUser.name };
        }

        return null;

    } catch (error) {
        console.error("Could not read mock state:", error);
        return null;
    }
}


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const foundUser = findUserInMockState(email);
    
    if (foundUser) {
      const result = updateUserInMockState(foundUser);
      if (result.success) {
        toast({ title: 'Login Successful', description: `Welcome back, ${foundUser.name}!` });
        router.push('/app');
      } else {
        toast({ variant: 'destructive', title: 'Login Failed', description: result.error });
      }
    } else {
      toast({ variant: 'destructive', title: 'Login Failed', description: 'User not found or credentials incorrect.' });
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-muted-foreground">Enter your credentials to access your dashboard.</p>
      </div>
      <form className="space-y-4" onSubmit={handleLogin}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
            <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="ml-auto inline-block text-sm underline text-muted-foreground hover:text-primary">
                    Forgot your password?
                </Link>
            </div>
          <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
      <div className="mt-4 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline font-medium hover:text-primary">
          Sign up
        </Link>
      </div>
    </div>
  );
}
