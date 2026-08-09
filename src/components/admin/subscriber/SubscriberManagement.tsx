"use client";

import { useEffect, useState, useCallback } from "react";
import type { SubscriptionRequest, RequestStatus } from "@/types/subscriber";
import { SubscriberList } from "./SubscriberList";

export function SubscriberManagement() {
    const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Pagination & Filter States
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

    const fetchRequests = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: page.toString(),
                search,
                status: statusFilter,
            });

            const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
            const json = await res.json();

            if (json.success) {
                setRequests(json.data);
                // Adjust if your API returns custom pagination metadata
                setTotalPages(json.totalPages || 1);
                setTotalCount(json.totalCount || json.data.length);
            }
        } catch (err) {
            console.error("Failed to load subscriber requests", err);
        } finally {
            setLoading(false);
        }
    }, [page, search, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (requestId: string, status: "accepted" | "rejected") => {
        try {
            setProcessingId(requestId);
            const res = await fetch("/api/admin/subscribers", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requestId, status }),
            });
            const json = await res.json();
            if (json.success) {
                setRequests((prev) =>
                    prev.map((req) => (req.id === requestId ? { ...req, status } : req))
                );
            }
        } catch (err) {
            console.error("Failed to update status", err);
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-neutral-900">Subscription Requests</h2>
                    <p className="text-sm text-neutral-500">Review and manage member subscription upgrade applications.</p>
                </div>
            </div>

            <SubscriberList
                requests={requests}
                loading={loading}
                page={page}
                setPage={setPage}
                totalPages={totalPages}
                totalCount={totalCount || requests.length}
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onAction={handleAction}
                processingId={processingId}
            />
        </div>
    );
}