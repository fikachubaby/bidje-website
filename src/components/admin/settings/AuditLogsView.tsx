"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { Activity, Clock, User } from "lucide-react";

interface AuditLog {
    id: string;
    action: string;
    performed_by: string;
    created_at: string;
    details?: string;
}

export function AuditLogsView() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLogs() {
            setLoading(true);
            // Assumes an 'audit_logs' table exists in Supabase
            const { data, error } = await supabase
                .from("audit_logs")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50);

            if (!error && data) {
                setLogs(data as AuditLog[]);
            }
            setLoading(false);
        }
        fetchLogs();
    }, []);

    if (loading) {
        return <div className="p-6 text-sm text-neutral-500">Loading audit records...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-black text-neutral-900">Activity Audit Logs</h2>
                    <p className="text-xs text-neutral-500">System trail of recent administrative actions and changes.</p>
                </div>

                <div className="divide-y divide-neutral-100">
                    {logs.length === 0 ? (
                        <p className="p-6 text-sm text-neutral-500">No logs found. (Ensure an `audit_logs` table exists if tracking is enabled).</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4">
                                <div className="flex items-start gap-3">
                                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-neutral-100 text-neutral-600">
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-neutral-900">{log.action}</p>
                                        {log.details && <p className="text-xs text-neutral-500 mt-0.5">{log.details}</p>}
                                        <p className="text-[11px] font-medium text-neutral-400 mt-1 flex items-center gap-1">
                                            <User className="h-3 w-3" /> {log.performed_by || "System"}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}