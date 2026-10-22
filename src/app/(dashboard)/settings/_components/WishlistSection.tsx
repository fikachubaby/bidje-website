"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import { getPropertiesByIds } from "@/lib/properties/property-service";
import type { Property } from "@/types/property";

/** Saved (hearted) properties, shown inside Settings. */
export function WishlistSection() {
    const { ids, ready, user } = useWishlist();
    // Keyed by id so overlapping fetches overwrite instead of duplicating.
    const [propertiesById, setPropertiesById] = useState<Record<string, Property>>({});
    const [loading, setLoading] = useState(true);
    const idKey = [...ids].sort().join(",");

    // Fetch only when new ids appear; un-favouriting just hides the card below.
    useEffect(() => {
        if (!ready) return;
        const missing = idKey.split(",").filter((id) => id && !propertiesById[id]);
        if (!missing.length) {
            setLoading(false);
            return;
        }
        getPropertiesByIds(missing)
            .then((rows) =>
                setPropertiesById((prev) => ({ ...prev, ...Object.fromEntries(rows.map((p) => [p.id, p])) }))
            )
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, idKey]);

    const visible = useMemo(
        () => [...ids].map((id) => propertiesById[id]).filter((p): p is Property => Boolean(p)),
        [propertiesById, ids]
    );

    return (
        <section id="wishlist" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold">
                <Heart className="h-5 w-5 text-[#e0b800]" /> My Wishlist
            </h2>
            <p className="mt-1 text-sm text-neutral-500">Properties you&apos;ve saved with the heart button.</p>

            {!ready || loading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                </div>
            ) : !user ? null : visible.length === 0 ? (
                <div className="mt-4 rounded-xl bg-neutral-50 p-8 text-center">
                    <Heart className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-3 font-bold">Your wishlist is empty</p>
                    <Link href="/properties" className="mt-4 inline-block text-sm font-bold underline">
                        Browse properties
                    </Link>
                </div>
            ) : (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                    ))}
                </div>
            )}
        </section>
    );
}
