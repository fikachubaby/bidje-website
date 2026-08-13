// src/components/admin/property/FlaggedPhotosReview.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { FormInput } from "@/components/admin/ui/FormField";

interface FlaggedPhoto {
    id: string;
    file_id: string;
    chat_id: string;
    created_at: string;
}

interface PropertyResult {
    id: string;
    name: string;
    district: string | null;
    state: string | null;
}

export function FlaggedPhotosReview() {
    const [photos, setPhotos] = useState<FlaggedPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [pickerOpenFor, setPickerOpenFor] = useState<string | null>(null);
    const [propertySearch, setPropertySearch] = useState("");
    const [searchResults, setSearchResults] = useState<PropertyResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [busyId, setBusyId] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadPhotos = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/telegram-photos/pending");
            const data = await res.json();
            setPhotos(data.photos ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPhotos();
    }, []);

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (!propertySearch.trim()) {
            setSearchResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(`/api/admin/properties/search?q=${encodeURIComponent(propertySearch)}`);
                const data = await res.json();
                setSearchResults(data.properties ?? []);
            } finally {
                setSearching(false);
            }
        }, 300);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [propertySearch]);

    const handleResolve = async (pendingPhotoId: string, propertyId: string) => {
        setBusyId(pendingPhotoId);
        try {
            const res = await fetch("/api/admin/telegram-photos/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pendingPhotoId, propertyId }),
            });
            if (!res.ok) throw new Error("Failed to resolve");
            setPhotos((prev) => prev.filter((p) => p.id !== pendingPhotoId));
            setPickerOpenFor(null);
            setPropertySearch("");
            setSearchResults([]);
        } catch {
            alert("Failed to attach photo. Please try again.");
        } finally {
            setBusyId(null);
        }
    };

    const handleDiscard = async (pendingPhotoId: string) => {
        if (!confirm("Discard this photo? It won't be attached to any property.")) return;
        setBusyId(pendingPhotoId);
        try {
            await fetch("/api/admin/telegram-photos/discard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pendingPhotoId }),
            });
            setPhotos((prev) => prev.filter((p) => p.id !== pendingPhotoId));
        } finally {
            setBusyId(null);
        }
    };

    const closePicker = () => {
        setPickerOpenFor(null);
        setPropertySearch("");
        setSearchResults([]);
    };

    if (loading || photos.length === 0) return null;

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 shadow-sm">
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex w-full items-center justify-between px-5 py-4"
            >
                <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <span className="font-bold text-amber-900">
                        {photos.length} Telegram photo{photos.length === 1 ? "" : "s"} need{photos.length === 1 ? "s" : ""} manual review
                    </span>
                    <span className="text-sm text-amber-700">
                        — couldn&apos;t be auto-matched to a property
                    </span>
                </div>
                {expanded ? (
                    <ChevronUp className="h-5 w-5 text-amber-600" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-amber-600" />
                )}
            </button>

            {expanded && (
                <div className="space-y-3 border-t border-amber-200 px-5 py-4">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-white p-3 sm:flex-row sm:items-center"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`/api/admin/telegram-photos/${photo.id}/preview`}
                                alt="Unmatched Telegram photo"
                                className="h-20 w-20 shrink-0 rounded-lg border border-neutral-200 object-cover"
                            />

                            <div className="flex-1">
                                <p className="text-sm text-neutral-600">
                                    Received {new Date(photo.created_at).toLocaleString()}
                                </p>
                                <p className="text-xs text-neutral-400">chat {photo.chat_id}</p>
                            </div>

                            {pickerOpenFor === photo.id ? (
                                <div className="flex w-full flex-col gap-2 sm:w-72">
                                    <div className="flex items-center gap-2">
                                        <FormInput
                                            autoFocus
                                            value={propertySearch}
                                            onChange={(e) => setPropertySearch(e.target.value)}
                                            placeholder="Search property..."
                                            className="mt-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={closePicker}
                                            className="rounded-lg border border-neutral-200 p-2 hover:bg-neutral-50"
                                            aria-label="Cancel"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {propertySearch && (
                                        <div className="max-h-40 overflow-y-auto rounded-lg border border-neutral-200 bg-white">
                                            {searching ? (
                                                <p className="px-3 py-2 text-sm text-neutral-400">Searching...</p>
                                            ) : searchResults.length === 0 ? (
                                                <p className="px-3 py-2 text-sm text-neutral-400">No matches</p>
                                            ) : (
                                                searchResults.map((p) => (
                                                    <button
                                                        key={p.id}
                                                        type="button"
                                                        disabled={busyId === photo.id}
                                                        onClick={() => handleResolve(photo.id, p.id)}
                                                        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-50 disabled:opacity-50"
                                                    >
                                                        <span className="font-semibold">{p.name}</span>
                                                        <span className="text-neutral-400"> — {p.district}, {p.state}</span>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setPickerOpenFor(photo.id)}
                                        disabled={busyId === photo.id}
                                    >
                                        Attach to property
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => handleDiscard(photo.id)}
                                        disabled={busyId === photo.id}
                                        className="rounded-lg border border-neutral-200 p-2 hover:bg-red-50 hover:text-red-600"
                                        aria-label="Discard photo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}