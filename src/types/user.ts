export type UserRole = 'visitor' | 'subscriber' | 'staff' | 'agent' | 'admin' | string;

export interface Role {
    id: string;
    name: string;
    description: string | null;
}

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: UserRole;
    created_at: string;
}