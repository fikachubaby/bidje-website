"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { mapSentimentRow } from "@/lib/utils/property-utils";
import type { PropertySentiment } from "@/types/property";

/** Server-rendered sentiment, kept live with Supabase Realtime. */
export function usePropertySentiment(propertyId: string, initial?: PropertySentiment) {
    const [sentiment, setSentiment] = useState(initial);

    useEffect(() => {
        const channel = supabase
            .channel(`sentiment:${propertyId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "property_sentiment", filter: `property_id=eq.${propertyId}` },
                (payload) => {
                    const row = mapSentimentRow(payload.new as Parameters<typeof mapSentimentRow>[0]);
                    if (row) setSentiment(row);
                }
            )
            .subscribe();
        return () => {
            void supabase.removeChannel(channel);
        };
    }, [propertyId]);

    return sentiment;
}
