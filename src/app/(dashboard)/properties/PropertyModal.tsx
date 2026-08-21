"use client";

import Link from "next/link";
import { Bath, Bed, ExternalLink, ImageOff, MapPin, Square, X } from "lucide-react";
import type { PropertyListing } from "@/types/property";
import { DEFAULT_PROPERTY_IMAGE } from "./utils";

interface PropertyModalProps {
    property: PropertyListing | null;
    onClose: () => void;
}

/** Popup showing full details for a single property. Renders nothing when `property` is null. */
export function PropertyModal({ property, onClose }: PropertyModalProps) {
    if (!property) return null;

    const hasImage = property.image && property.image !== DEFAULT_PROPERTY_IMAGE;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100">
                <div className="relative h-60 w-full bg-neutral-100">
                    {hasImage ? (
                        <img
                            src={property.image}
                            alt={property.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE;
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
                            <ImageOff className="h-10 w-10 stroke-1 mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">No Image Available</span>
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md transition-transform hover:scale-105"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <span className="absolute bottom-4 left-4 z-10 rounded-xl bg-black/70 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        {property.type}
                    </span>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <span className="text-xl font-bold text-black">{property.price}</span>
                        <h2 className="mt-1 text-lg font-bold text-neutral-900">{property.title}</h2>
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                            <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                            <span>{property.location}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-neutral-50 p-4 border border-neutral-100 text-center text-xs">
                        <div className="flex flex-col items-center gap-1">
                            <Bed className="h-5 w-5 text-neutral-500" />
                            <span className="font-bold text-black">{property.beds} Bedrooms</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Bath className="h-5 w-5 text-neutral-500" />
                            <span className="font-bold text-black">{property.baths} Bathrooms</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Square className="h-5 w-5 text-neutral-500" />
                            <span className="font-bold text-black">{property.sqft} sqft</span>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="rounded-xl border border-neutral-200 px-5 py-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
                        >
                            Close
                        </button>
                        <Link
                            href={`/properties/${property.slug || property.id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors"
                        >
                            Full Property Listing <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
