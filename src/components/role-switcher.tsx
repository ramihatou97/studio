
import type { AppState, UserRole } from "@/lib/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select";

interface RoleSwitcherProps {
    appState: AppState;
    setAppState: React.Dispatch<React.SetStateAction<AppState | null>>;
}

export function RoleSwitcher({ appState, setAppState }: RoleSwitcherProps) {
    const { residents, staff, currentUser } = appState;

    const handleRoleChange = (value: string) => {
        const [role, id] = value.split(':');
        
        let name = '';
        if (role === 'program-director') {
            name = 'Program Director';
        } else if (role === 'staff') {
            name = staff.find(s => s.id === id)?.name || 'Staff';
        } else if (role === 'resident') {
            name = residents.find(r => r.id === id)?.name || 'Resident';
        }

        setAppState(prev => prev ? ({
            ...prev,
            currentUser: { role: role as UserRole, id, name }
        }) : null);
    };

    const currentValue = `${currentUser.role}:${currentUser.id}`;

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Viewing as:</span>
            <Select onValueChange={handleRoleChange} value={currentValue}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value="program-director:program-director">Program Director</SelectItem>
                    </SelectGroup>
                    
                    {staff.length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Staff</SelectLabel>
                            {staff.map(s => (
                                <SelectItem key={s.id} value={`staff:${s.id}`}>{s.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}

                    {residents.filter(r => r.type === 'neuro').length > 0 && (
                        <SelectGroup>
                            <SelectLabel>Residents</SelectLabel>
                            {residents.filter(r => r.type === 'neuro').map(r => (
                                <SelectItem key={r.id} value={`resident:${r.id}`}>{r.name}</SelectItem>
                            ))}
                        </SelectGroup>
                    )}
                </SelectContent>
            </Select>
        </div>
    );
}
