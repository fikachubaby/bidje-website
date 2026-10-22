"use client";

import { useCallback, useEffect, useState } from "react";
import { Home, Loader2, MapPin, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListPropertyModal } from "@/components/property/ListPropertyModal";
import type { PropertyRequestStatus } from "@/types/property-request";

interface MyListing {
    id: string;
    property_address: string;
    expected_price: string;
    status: PropertyRequestStatus;
    created_at: string;
}

const STATUS_META: Record<PropertyRequestStatus, { label: string; hint: string; className: string }> = {
    pending: { label: "Pending review", hint: "Our team will contact you shortly.", className: "bg-amber-50 text-amber-800 border-amber-200" },
    contacted: { label: "Agent contacted", hint: "An agent has reached out to you.", className: "bg-blue-50 text-blue-800 border-blue-200" },
    approved: { label: "Approved", hint: "Your property is being listed.", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    rejected: { label: "Not accepted", hint: "Contact us for more details.", className: "bg-red-50 text-red-700 border-red-200" },
};

/** Properties the subscriber has submitted for sale, with their review status. */
export function MyListings() {
    const [listings, setListings] = useState<MyListing[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const res = await fetch("/api/properties/list-request");
            const data = await res.json();
            if (res.ok) setListings(data.requests);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-3 border-b border-neutral-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                        <Home className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-black">My Listed Properties</h2>
                        <p className="text-xs text-neutral-500">Properties you&apos;ve submitted to sell, and where they stand</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex w-fit items-center gap-2 rounded-xl bg-[#ffd400] px-4 py-2 text-xs font-black text-black transition hover:bg-[#ffe24b]"
                >
                    <PlusCircle className="h-4 w-4" />
                    List a property
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : listings.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">
                    You haven&apos;t listed any properties yet.
                </p>
            ) : (
                <ul className="mt-4 divide-y divide-neutral-100">
                    {listings.map((l) => {
                        const meta = STATUS_META[l.status] ?? STATUS_META.pending;
                        return (
                            <li key={l.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-1.5 truncate text-sm font-bold text-black">
                                        <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                                        <span className="truncate">{l.property_address}</span>
                                    </p>
                                    <p className="mt-1 text-xs text-neutral-500">
                                        Expected {l.expected_price} · Submitted{" "}
                                        {new Date(l.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                    </p>
                                </div>
                                <div className="sm:text-right">
                                    <span className={cn("inline-block rounded-full border px-3 py-1 text-xs font-bold", meta.className)}>
                                        {meta.label}
                                    </span>
                                    <p className="mt-1 text-[11px] text-neutral-500">{meta.hint}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            <ListPropertyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={load} />
        </div>
    );
}
