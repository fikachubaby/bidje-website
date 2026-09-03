import type { PropertyRequestStatus } from "@/types/property-request";

export const PROPERTY_REQUEST_STATUS_BADGES: Record<PropertyRequestStatus, string> = {
    pending: "bg-amber-100 text-amber-800 border-amber-200",
    contacted: "bg-blue-100 text-blue-800 border-blue-200",
    approved: "bg-emerald-100 text-emerald-800 border-emerald-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
};

export const PROPERTY_REQUEST_STATUS_OPTIONS: { value: PropertyRequestStatus; label: string }[] = [
    { value: "pending", label: "Pending" },
    { value: "contacted", label: "Contacted" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
];