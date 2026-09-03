"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Phone, MapPin, Calendar, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";
import type { PropertyRequest, PropertyRequestStatus } from "@/types/property-request";
import { PROPERTY_REQUEST_STATUS_BADGES, PROPERTY_REQUEST_STATUS_OPTIONS, } from "@/constants/property-request";

export function PropertyRequestsView() {
    const [requests, setRequests] = useState<PropertyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const from = (currentPage - 1) * pageSize;
            const to = from + pageSize - 1;

            let query = supabase
                .from("property_requests")
                .select("*", { count: "exact" })
                .order("created_at", { ascending: false })
                .range(from, to);

            if (statusFilter !== "all") {
                query = query.eq("status", statusFilter);
            }

            if (search.trim()) {
                query = query.or(
                    `full_name.ilike.%${search}%,property_address.ilike.%${search}%,phone_number.ilike.%${search}%`
                );
            }

            const { data, count, error } = await query;
            if (error) throw error;

            setRequests(data || []);
            setTotalItems(count || 0);
        } catch (err) {
            console.error("Error fetching property requests:", err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, search, statusFilter]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from("property_requests")
                .update({ status: newStatus, updated_at: new Date().toISOString() })
                .eq("id", id);

            if (error) throw error;

            setRequests((prev) =>
                prev.map((item) =>
                    item.id === id
                        ? { ...item, status: newStatus as PropertyRequestStatus }
                        : item
                )
            );
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-4 rounded-2xl border border-neutral-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name, address, or phone..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-xs font-medium focus:border-black focus:bg-white focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilterChange(e.target.value)}
                        className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-bold text-neutral-700 focus:outline-none"
                    >
                        <option value="all">All Statuses</option>
                        {PROPERTY_REQUEST_STATUS_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={fetchRequests}
                        className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                        title="Refresh list"
                    >
                        <RefreshCw className={`h-4 w-4 text-neutral-600 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {loading ? (
                    <div className="p-12 text-center text-xs font-semibold text-neutral-500">
                        Loading requests...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="p-12 text-center text-xs font-semibold text-neutral-500">
                        No property listing requests found.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-500 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Seller Info</th>
                                        <th className="px-6 py-4">Property Details</th>
                                        <th className="px-6 py-4">Target Price</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Submitted</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                                    {requests.map((item) => {
                                        const cleanPhone = item.phone_number.replace(/\D/g, "");
                                        const waUrl = `https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(
                                            item.full_name
                                        )},%20I%20am%20following%20up%20on%20your%20property%20listing%20request%20at%20${encodeURIComponent(
                                            item.property_address
                                        )}%20on%20BIDJE.com`;

                                        return (
                                            <tr key={item.id} className="hover:bg-neutral-50/60 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-neutral-900">{item.full_name}</div>
                                                    <div className="flex items-center gap-1 mt-0.5 text-neutral-500">
                                                        <Phone className="h-3 w-3" />
                                                        <span>{item.phone_number}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 max-w-xs">
                                                    <div className="flex items-start gap-1.5 text-neutral-700 font-semibold line-clamp-2">
                                                        <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                                                        <span>{item.property_address}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 font-black text-neutral-900">
                                                    {item.expected_price}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <select
                                                        value={item.status}
                                                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold capitalize transition-colors focus:outline-none ${PROPERTY_REQUEST_STATUS_BADGES[item.status] || PROPERTY_REQUEST_STATUS_BADGES.pending
                                                            }`}
                                                    >
                                                        {PROPERTY_REQUEST_STATUS_OPTIONS.map(({ value, label }) => (
                                                            <option key={value} value={value}>
                                                                {label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>

                                                <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-neutral-400" />
                                                        <span>{new Date(item.created_at).toLocaleDateString("en-GB")}</span>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <a
                                                        href={waUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-emerald-600 transition-colors"
                                                    >
                                                        <Phone className="h-3 w-3 fill-current" />
                                                        <span>WhatsApp</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <PaginationDashboard
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize);
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}
            </div>
        </div>
    );
}