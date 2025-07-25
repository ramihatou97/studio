
"use client";

import type { CurrentUser } from "@/lib/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from '@/hooks/use-toast';

interface RoleSwitcherProps {
    allUsers: CurrentUser[];
    currentUser: CurrentUser;
    onUserSwitch: (user: CurrentUser) => void;
}

export function RoleSwitcher({ allUsers, currentUser, onUserSwitch }: RoleSwitcherProps) {
    const { toast } = useToast();

    const handleRoleChange = (userId: string) => {
        const userToSwitchTo = allUsers.find(u => u.id === userId);
        if (userToSwitchTo) {
            onUserSwitch(userToSwitchTo);
        }
    };
    
    const staff = allUsers.filter(u => u.role === 'staff');
    const residents = allUsers.filter(u => u.role === 'resident');
    const programDirector = allUsers.find(u => u.role === 'program-director');
    const developer = allUsers.find(u => u.role === 'developer');

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Viewing as:</span>
            <Select onValueChange={handleRoleChange} value={currentUser.id}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                    {(programDirector || developer) && (
                        <SelectGroup>
                            <SelectLabel>Admin Roles</SelectLabel>
                            {programDirector && <SelectItem value={programDirector.id}>Program Director</SelectItem>}
                            {developer && <SelectItem value={developer.id}>Developer</SelectItem>}
                        </SelectGroup>
                    )}
                    
                    {staff.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Staff</SelectLabel>
                            {staff.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}

                    {residents.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Residents</SelectLabel>
                            {residents.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
