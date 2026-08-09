"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { Shield, UserCheck, Mail, Calendar } from "lucide-react";

interface StaffUser {
    id: string;
    email: string;
    role: string;
    created_at: string;
}

export function UsersManagementView() {
    const [users, setUsers] = useState<StaffUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        // Assumes a public 'profiles' or 'users' table linking to auth.users
        const { data, error } = await supabase
            .from("profiles")
            .select("id, email, role, created_at")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setUsers(data as StaffUser[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert("Failed to update user role");
        } else {
            setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
        }
        setUpdatingId(null);
    };

    if (loading) {
        return <div className="p-6 text-sm text-neutral-500">Loading staff accounts...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-black text-neutral-900">Staff & Permissions</h2>
                    <p className="text-xs text-neutral-500">Manage portal access levels and assign user roles.</p>
                </div>

                <div className="divide-y divide-neutral-100">
                    {users.length === 0 ? (
                        <p className="p-6 text-sm text-neutral-500">No user profiles found in database table `profiles`.</p>
                    ) : (
                        users.map((staff) => (
                            <div key={staff.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-700 font-bold">
                                        {staff.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">{staff.email}</p>
                                        <p className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                                            <Calendar className="h-3 w-3" />
                                            Joined {new Date(staff.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500">
                                        <Shield className="h-4 w-4 text-neutral-400" />
                                        Role:
                                    </div>
                                    <select
                                        disabled={updatingId === staff.id}
                                        value={staff.role || "staff"}
                                        onChange={(e) => handleRoleChange(staff.id, e.target.value)}
                                        aria-label={`Change role for ${staff.email}`}
                                        className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-sm focus:border-neutral-900 focus:outline-none"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="staff">Staff</option>
                                        <option value="editor">Editor</option>
                                    </select>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}