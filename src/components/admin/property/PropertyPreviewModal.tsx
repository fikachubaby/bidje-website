"use client";

import { Edit3, X } from "lucide-react";
import { StatusBadge } from "@/components/admin/ui/StatusBadge";
import { formatPrice } from "@/lib/utils";
import type { AdminProperty } from "@/types/property";

interface PropertyPreviewModalProps {
    property: AdminProperty;
    onClose: () => void;
    onEdit: (property: AdminProperty) => void;
}

export function PropertyPreviewModal({
    property,
    onClose,
    onEdit,
}: PropertyPreviewModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
                    <div>
                        {property.telegramCode && (
                            <span className="mb-1 inline-block rounded-md bg-neutral-100 px-2 py-0.5 text-xs font-mono font-bold text-neutral-600">
                                {property.telegramCode}
                            </span>
                        )}
                        <h2 className="text-xl font-bold text-neutral-900">{property.name}</h2>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-neutral-400 hover:bg-neutral-100"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Details Grid & Description */}
                <div className="my-5 max-h-[60vh] space-y-4 overflow-y-auto text-sm text-neutral-600">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Price</p>
                            <p className="text-base font-black text-neutral-900">{formatPrice(property.price)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Status</p>
                            <div className="mt-1">
                                <StatusBadge status={property.status} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Location</p>
                            <p className="font-semibold text-neutral-800">{property.district}, {property.state}</p>
                            <p className="text-xs text-neutral-500">{property.address}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Type & Tenure</p>
                            <p className="font-semibold text-neutral-800">{property.propertyType} · {property.tenure}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">Description</p>
                        <p className="whitespace-pre-line text-xs leading-relaxed text-neutral-700">
                            {property.description || "No description provided."}
                        </p>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-end gap-3 border-t border-neutral-100 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-bold text-neutral-700 hover:bg-neutral-50"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit(property)}
                        className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800"
                    >
                        <Edit3 className="h-4 w-4" />
                        Edit Property
                    </button>
                </div>
            </div>
        </div>
    );
}