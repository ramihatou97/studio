
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";

export default function SignupPage() {
  const [role, setRole] = useState('');

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-muted-foreground">Enter your information to get started.</p>
      </div>
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input id="first-name" placeholder="Max" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input id="last-name" placeholder="Robinson" required />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required />
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
                <Select required>
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
          Create Account
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
