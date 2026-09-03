"use client";

import { useState } from "react";
import { Bell, ClipboardList, Tag, ArrowRight } from "lucide-react";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";

interface AdminNotificationBellProps {
    onNavigate: (view: string) => void;
}

export function AdminNotificationBell({ onNavigate }: AdminNotificationBellProps) {
    const [open, setOpen] = useState(false);
    const { counts, loading } = useAdminNotifications();

    return (
        <div className="relative">
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="relative rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-700 transition-colors hover:bg-neutral-100"
                aria-label="View notifications"
            >
                <Bell className="h-5 w-5" />
                {!loading && counts.total > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-sm animate-pulse">
                        {counts.total > 99 ? "99+" : counts.total}
                    </span>
                )}
            </button>

            {/* Popover Dropdown */}
            {open && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 mt-2 z-30 w-80 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xl">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 px-1">
                            <h3 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                                Notifications
                            </h3>
                            {counts.total > 0 ? (
                                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                    {counts.total} Pending
                                </span>
                            ) : (
                                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                    All Clear
                                </span>
                            )}
                        </div>

                        <div className="mt-2 space-y-1.5">
                            {/* Property Requests Item */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate("property-requests");
                                }}
                                className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-50 p-2 text-amber-600 border border-amber-100">
                                        <ClipboardList className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Listing Requests</p>
                                        <p className="text-[11px] text-neutral-500">
                                            {counts.propertyRequests} awaiting review
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </button>

                            {/* Offers Item */}
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onNavigate("offers");
                                }}
                                className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-neutral-50"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-50 p-2 text-blue-600 border border-blue-100">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-neutral-900">Property Offers</p>
                                        <p className="text-[11px] text-neutral-500">
                                            {counts.offers} pending action
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="h-4 w-4 text-neutral-400" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}