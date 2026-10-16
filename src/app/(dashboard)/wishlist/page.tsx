"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Loader2 } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { useWishlist } from "@/hooks/useWishlist";
import { getPropertiesByIds } from "@/lib/properties/property-service";
import type { Property } from "@/types/property";

export default function WishlistPage() {
    const { ids, ready, user } = useWishlist();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const idKey = [...ids].sort().join(",");

    // Fetch only when new ids appear; un-favouriting just hides the card below.
    useEffect(() => {
        if (!ready) return;
        const missing = idKey.split(",").filter((id) => id && !properties.some((p) => p.id === id));
        if (!missing.length) {
            setLoading(false);
            return;
        }
        getPropertiesByIds(missing)
            .then((rows) => setProperties((prev) => [...prev, ...rows]))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ready, idKey]);

    const visible = useMemo(() => properties.filter((p) => ids.has(p.id)), [properties, ids]);

    if (!ready || loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="mx-auto max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                <p className="font-bold">Sign in to see your wishlist.</p>
                <Link href="/login?next=/wishlist" className="mt-4 inline-block text-sm font-bold underline">
                    Sign in
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-3xl font-black tracking-tight">My Wishlist</h1>
                <p className="mt-1 text-sm text-neutral-500">Properties you&apos;ve saved with the heart button.</p>
            </div>

            {visible.length === 0 ? (
                <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
                    <Heart className="mx-auto h-8 w-8 text-neutral-300" />
                    <p className="mt-3 font-bold">Your wishlist is empty</p>
                    <Link href="/properties" className="mt-4 inline-block text-sm font-bold underline">
                        Browse properties
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {visible.map((p) => (
                        <PropertyCard key={p.id} property={p} />
                    ))}
                </div>
            )}
        </div>
    );
}
