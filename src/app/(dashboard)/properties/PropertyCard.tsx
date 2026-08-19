"use client";

import { Bath, Bed, Heart, MapPin, Square, ImageOff, ExternalLink } from "lucide-react";
import type { PropertyListing } from "@/types/property";
import { DEFAULT_PROPERTY_IMAGE } from "./utils";

interface PropertyCardProps {
    listing: PropertyListing;
    actionLabel?: string;
    onAction?: (listing: PropertyListing) => void;
}

/** A single property card used in the Featured Property Listings grid. */
export function PropertyCard({ listing, actionLabel = "Select Offer", onAction }: PropertyCardProps) {
    const hasImage = listing.image && listing.image !== DEFAULT_PROPERTY_IMAGE;

    return (
        <div className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white transition-all hover:border-black flex flex-col justify-between">
            <div>
                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                    {hasImage ? (
                        <img
                            src={listing.image}
                            alt={listing.title || "Property listing image"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE;
                            }}
                        />
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
                            <ImageOff className="h-8 w-8 stroke-1 mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                        </div>
                    )}
                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white text-black shadow-sm">
                        <Heart className="h-4 w-4" />
                    </div>
                    <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {listing.type}
                    </div>
                </div>

                <div className="p-5">
                    <div className="text-lg font-bold text-black">{listing.price}</div>
                    <h3 className="mt-1 font-semibold text-neutral-900 line-clamp-1">{listing.title}</h3>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                        <span className="truncate">{listing.location}</span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-t border-b border-neutral-100 text-xs text-neutral-600">
                        <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4 text-neutral-400" />
                            <span>{listing.beds} Beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4 text-neutral-400" />
                            <span>{listing.baths} Baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Square className="h-4 w-4 text-neutral-400" />
                            <span>{listing.sqft} sqft</span>
                        </div>
                    </div>
                </div>
            </div>

            {onAction && (
                <div className="p-5 pt-0">
                    <button
                        onClick={() => onAction(listing)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
                    >
                        {actionLabel} <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}
