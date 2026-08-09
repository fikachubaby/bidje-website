"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { Shield, Calendar, User, Phone, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import type { Profile, Role } from "@/types/user";

const PAGE_SIZE = 10;

export function UsersManagementView() {
    const [users, setUsers] = useState<Profile[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [, startTransition] = useTransition();

    const fetchRoles = async () => {
        const { data, error } = await supabase.from("roles").select("*").order("name", { ascending: true });
        if (!error && data) {
            setRoles(data as Role[]);
        }
    };

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("profiles")
                .select("*", { count: "exact" });

            if (search.trim()) {
                query = query.or(`email.ilike.%${search.trim()}%,full_name.ilike.%${search.trim()}%`);
            }

            if (roleFilter !== "All") {
                query = query.eq("role", roleFilter);
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query
                .order("created_at", { ascending: false })
                .range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            if (data) {
                setUsers(data as Profile[]);
            }
            if (count !== null) {
                setTotalCount(count);
                setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, page]);

    useEffect(() => {
        fetchRoles();
    }, []);

    useEffect(() => {
        startTransition(() => {
            fetchUsers();
        });
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert(`Failed to update user role: ${error.message}`);
        } else {
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );

            const { data: userData } = await supabase.auth.getUser();
            await supabase.from("audit_logs").insert({
                actor_id: userData.user?.id || null,
                action: `Changed user role to '${newRole}'`,
                entity: "profiles",
                entity_id: userId,
            });
        }
        setUpdatingId(null);
    };

    return (
        <div className="space-y-6">
            {/* Search and Role Filter Bar */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by user name or email..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={roleFilter}
                    onChange={(e) => {
                        setRoleFilter(e.target.value);
                        setPage(1);
                    }}
                    className="mt-0 sm:w-48"
                >
                    <option value="All">All roles</option>
                    {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                        </option>
                    ))}
                </FormSelect>
            </div>

            {/* Users Data Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-[960px] w-full text-left text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50">
                            <tr>
                                <th className="px-5 py-4 font-bold text-neutral-600">User Profile</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Contact Info</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Joined Date</th>
                                <th className="px-5 py-4 font-bold text-neutral-600">Role Assignment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-neutral-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                                            Loading users from database...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-neutral-500">
                                        No users match your filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((profile) => (
                                    <tr key={profile.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-700 font-bold">
                                                    {profile.full_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || <User className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-neutral-900">{profile.full_name || "Unnamed User"}</p>
                                                    <p className="text-xs text-neutral-500">{profile.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-neutral-600 text-xs">
                                            {profile.phone ? (
                                                <span className="flex items-center gap-1.5 font-medium">
                                                    <Phone className="h-3.5 w-3.5 text-neutral-400" /> {profile.phone}
                                                </span>
                                            ) : (
                                                <span className="text-neutral-400">No phone provided</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                {new Date(profile.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-neutral-400 shrink-0" />
                                                <select
                                                    disabled={updatingId === profile.id}
                                                    value={profile.role}
                                                    onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                                                    aria-label={`Change role for ${profile.email}`}
                                                    className="rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 shadow-sm focus:border-neutral-900 focus:outline-none disabled:opacity-50 cursor-pointer"
                                                >
                                                    {roles.map((r) => (
                                                        <option key={r.id} value={r.name}>
                                                            {r.name.charAt(0).toUpperCase() + r.name.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {updatingId === profile.id && (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Standardized Pagination Controls Bar */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-neutral-500">
                    Showing page <span className="font-semibold text-neutral-800">{page}</span> of <span className="font-semibold text-neutral-800">{totalPages}</span> (Total: {totalCount} users)
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setPage(Math.max(page - 1, 1))}
                        disabled={page <= 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setPage(Math.min(page + 1, totalPages))}
                        disabled={page >= totalPages || loading}
                    >
                        Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    );
}