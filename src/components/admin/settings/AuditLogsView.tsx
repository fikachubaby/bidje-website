"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { Activity, Clock, User, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";

const PAGE_SIZE = 15;

interface AuditLog {
    id: string;
    actor_id: string | null;
    action: string;
    entity: string;
    entity_id: string | null;
    created_at: string;
    profiles?: {
        email: string;
        full_name: string | null;
    };
}

export function AuditLogsView() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState<string>("All");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [, startTransition] = useTransition();

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("audit_logs")
                .select(`
                    id,
                    actor_id,
                    action,
                    entity,
                    entity_id,
                    created_at,
                    profiles:actor_id (email, full_name)
                `, { count: "exact" });

            if (search.trim()) {
                query = query.or(`action.ilike.%${search.trim()}%,entity.ilike.%${search.trim()}%`);
            }

            if (entityFilter !== "All") {
                query = query.eq("entity", entityFilter);
            }

            const from = (page - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            query = query
                .order("created_at", { ascending: false })
                .range(from, to);

            const { data, count, error } = await query;

            if (error) throw error;

            if (data) {
                setLogs(data as unknown as AuditLog[]);
            }
            if (count !== null) {
                setTotalCount(count);
                setTotalPages(Math.max(1, Math.ceil(count / PAGE_SIZE)));
            }
        } catch (err) {
            console.error("Failed to load audit logs:", err);
        } finally {
            setLoading(false);
        }
    }, [search, entityFilter, page]);

    useEffect(() => {
        startTransition(() => {
            fetchLogs();
        });
    }, [fetchLogs]);

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search logs by action or entity name..."
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={entityFilter}
                    onChange={(e) => {
                        setEntityFilter(e.target.value);
                        setPage(1);
                    }}
                    className="mt-0 sm:w-48"
                >
                    <option value="All">All entities</option>
                    <option value="properties">Properties</option>
                    <option value="profiles">Users</option>
                    <option value="subscriptions">Subscriptions</option>
                    <option value="offers">Offers</option>
                    <option value="advertisements">Advertisements</option>
                </FormSelect>
            </div>

            {/* Audit Logs Table Container */}
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-black text-neutral-900">Activity Audit Logs</h2>
                    <p className="text-xs text-neutral-500">System trail of administrative actions, modifications, and security updates.</p>
                </div>

                <div className="divide-y divide-neutral-100 text-sm">
                    {loading ? (
                        <div className="flex items-center justify-center p-12 text-neutral-500 gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                            Loading audit records...
                        </div>
                    ) : logs.length === 0 ? (
                        <p className="p-12 text-center text-neutral-400">No audit logs match your filter criteria.</p>
                    ) : (
                        logs.map((log) => {
                            const actor = log.profiles;
                            return (
                                <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 hover:bg-neutral-50/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600 font-bold">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-neutral-900">{log.action}</p>
                                                <span className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-neutral-600">
                                                    {log.entity}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-neutral-400">
                                                <span className="flex items-center gap-1 font-medium text-neutral-600">
                                                    <User className="h-3 w-3 text-neutral-400" />
                                                    {actor?.full_name || actor?.email || "System Actor"}
                                                </span>
                                                {log.entity_id && (
                                                    <span className="font-mono text-[11px] text-neutral-400">
                                                        ID: {log.entity_id.substring(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                                        <Clock className="h-3.5 w-3.5" />
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Pagination Controls Bar */}
            <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-neutral-500">
                    Showing page <span className="font-semibold text-neutral-800">{page}</span> of <span className="font-semibold text-neutral-800">{totalPages}</span> (Total: {totalCount} logs)
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