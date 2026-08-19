"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import type { PropertyListing } from "@/types/property";
import { useFeaturedListings } from "./useFeaturedListings";
import { PropertyCard } from "./PropertyCard";

interface FeaturedListingsProps {
    isMember: boolean;
    /** Called when the user clicks the action button on a card (e.g. "Select Offer"). Omit to hide the action button. */
    onSelect?: (listing: PropertyListing) => void;
    actionLabel?: string;
    limit?: number;
}

/** "Featured Property Listings" dashboard section: newest properties first, with resolved images. */
export function FeaturedListings({ isMember, onSelect, actionLabel, limit = 9 }: FeaturedListingsProps) {
    const { listings, loading } = useFeaturedListings(isMember, limit);

    return (
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-3">
                <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-black">Featured Property Listings</h2>
                        <p className="text-xs text-neutral-500">Explore latest property availability</p>
                    </div>
                </div>

                <Link
                    href="/properties"
                    className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800 w-fit"
                >
                    Browse All Properties
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p className="col-span-full py-8 text-center text-sm text-neutral-500">Loading properties…</p>
                ) : listings.length === 0 ? (
                    <p className="col-span-full py-8 text-center text-sm text-neutral-500">
                        No property listings available at the moment.
                    </p>
                ) : (
                    listings.map((listing) => (
                        <PropertyCard
                            key={listing.id}
                            listing={listing}
                            actionLabel={actionLabel}
                            onAction={onSelect}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
