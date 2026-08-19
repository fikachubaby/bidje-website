"use client";

import { useEffect, useState } from "react";
import type { PropertyListing } from "@/types/property";
import { supabase } from "@/lib/supabase/supabase";
import { isExcludedFromListing, mapPropertyRowToListing } from "./utils";
import type { RawPropertyRow } from "./types";

interface UseFeaturedListingsResult {
    listings: PropertyListing[];
    loading: boolean;
}

/**
 * Fetches the newest published properties for the "Featured Property
 * Listings" section. Ordered newest-first at the database level so paging
 * or raising the limit later stays correct without re-sorting client side.
 */
export function useFeaturedListings(isMember: boolean, limit = 9): UseFeaturedListingsResult {
    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("properties")
                    .select(`
                        id, title, district, state, asking_price, property_type, bedrooms, bathrooms, area_sqft, status, created_at,
                        property_images ( id, image_url, is_cover, display_order )
                    `)
                    .order("created_at", { ascending: false, nullsFirst: false })
                    .limit(limit * 3); // fetch a buffer since some rows get excluded by status

                if (error) throw error;

                const mapped = (data ?? [] as RawPropertyRow[])
                    .filter((row) => !isExcludedFromListing((row as RawPropertyRow).status))
                    .map((row) => mapPropertyRowToListing(row as RawPropertyRow, isMember))
                    .filter((listing): listing is PropertyListing => listing !== null)
                    .slice(0, limit);

                if (!cancelled) setListings(mapped);
            } catch (err) {
                const supabaseErr = err as { message?: string; details?: string; hint?: string; code?: string };
                console.error("Failed to load featured listings:", {
                    message: supabaseErr?.message,
                    details: supabaseErr?.details,
                    hint: supabaseErr?.hint,
                    code: supabaseErr?.code,
                    raw: err,
                });
                if (!cancelled) setListings([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();
        return () => {
            cancelled = true;
        };
    }, [isMember, limit]);

    return { listings, loading };
}
