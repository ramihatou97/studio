
"use client";

import { useRouter } from 'next/navigation';
import type { UserProfile } from "@/lib/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, SelectSeparator } from "./ui/select";
import { LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface RoleSwitcherProps {
    allUsers: UserProfile[];
    currentUser: UserProfile;
    setSwitchedUser: (user: UserProfile) => void;
}

export function RoleSwitcher({ allUsers, currentUser, setSwitchedUser }: RoleSwitcherProps) {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
            router.push('/login');
        } catch (error) {
            toast({ variant: 'destructive', title: 'Logout Failed', description: 'Could not log you out. Please try again.' });
        }
    };
    
    if (currentUser.role !== 'program-director') {
        return (
             <Button variant="ghost" onClick={handleLogout} className="text-sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        )
    }

    const handleRoleChange = (value: string) => {
        if (value === 'logout') {
            handleLogout();
            return;
        }
        
        const userToSwitchTo = allUsers.find(u => u.uid === value);
        if (userToSwitchTo) {
            setSwitchedUser(userToSwitchTo);
        }
    };
    
    const staff = allUsers.filter(u => u.role === 'staff' && u.status === 'active');
    const residents = allUsers.filter(u => u.role === 'resident' && u.status === 'active');
    const programDirector = allUsers.find(u => u.role === 'program-director');


    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Viewing as:</span>
            <Select onValueChange={handleRoleChange} value={currentUser.uid}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                    {programDirector && (
                        <SelectGroup>
                            <SelectLabel>Roles</SelectLabel>
                            <SelectItem value={programDirector.uid}>Program Director</SelectItem>
                        </SelectGroup>
                    )}
                    
                    {staff.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Staff</SelectLabel>
                            {staff.map(s => (
                                <SelectItem key={s.uid} value={s.uid}>{s.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}

                    {residents.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Residents</SelectLabel>
                            {residents.map(r => (
                                <SelectItem key={r.uid} value={r.uid}>{r.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                    <SelectSeparator />
                     <SelectItem value="logout" className="text-destructive">
                        <div className="flex items-center gap-2">
                           <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
