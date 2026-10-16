"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/supabase";
import { isEmailVerified, useWishlist } from "@/hooks/useWishlist";
import { OPINION_LABELS, countFor, opinionTotal, type Opinion } from "@/lib/score/sentiment";
import type { PropertySentiment } from "@/types/property";

interface PriceOpinionProps {
    propertyId: string;
    sentiment?: PropertySentiment;
}

/** "Is this price fair?" — one vote per signed-in, verified user. */
export function PriceOpinion({ propertyId, sentiment }: PriceOpinionProps) {
    // The wishlist store already tracks the signed-in user for the page.
    const { user, ready } = useWishlist();
    const [mine, setMine] = useState<Opinion | null>(null);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!user) {
            setMine(null);
            return;
        }
        let cancelled = false;
        void supabase
            .from("property_opinions")
            .select("opinion")
            .eq("user_id", user.id)
            .eq("property_id", propertyId)
            .maybeSingle()
            .then(({ data }) => {
                if (!cancelled) setMine((data?.opinion as Opinion) ?? null);
            });
        return () => {
            cancelled = true;
        };
    }, [user, propertyId]);

    async function vote(opinion: Opinion) {
        if (!user) {
            toast("Sign in to share your view on this price", {
                action: {
                    label: "Sign in",
                    onClick: () => {
                        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
                    },
                },
            });
            return;
        }
        if (!isEmailVerified(user)) {
            toast.error("Please verify your email to vote");
            return;
        }

        const previous = mine;
        const next = previous === opinion ? null : opinion; // tap again to withdraw
        setMine(next);
        setBusy(true);
        const { error } = next
            ? await supabase
                  .from("property_opinions")
                  .upsert(
                      { user_id: user.id, property_id: propertyId, opinion: next, updated_at: new Date().toISOString() },
                      { onConflict: "user_id,property_id" }
                  )
            : await supabase.from("property_opinions").delete().eq("user_id", user.id).eq("property_id", propertyId);
        setBusy(false);

        if (error) {
            setMine(previous);
            toast.error("Couldn't save your vote. Please try again.");
        }
    }

    const total = opinionTotal(sentiment);

    return (
        <div className="mt-5 border-t border-black/10 pt-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Is this price fair?</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
                {(Object.keys(OPINION_LABELS) as Opinion[]).map((o) => {
                    const count = sentiment ? countFor(sentiment, o) : 0;
                    const pct = total ? Math.round((count / total) * 100) : 0;
                    return (
                        <button
                            key={o}
                            type="button"
                            disabled={!ready || busy}
                            onClick={() => void vote(o)}
                            aria-pressed={mine === o}
                            className={cn(
                                "rounded-xl border-2 px-2 py-2 text-xs font-black transition disabled:opacity-60",
                                mine === o
                                    ? "border-black bg-[#ffd400] text-black shadow-[2px_2px_0_0_#000]"
                                    : "border-black/15 bg-white text-neutral-700 hover:border-black"
                            )}
                        >
                            {OPINION_LABELS[o]}
                            {total > 0 && <span className="block text-[10px] font-bold text-neutral-500">{pct}%</span>}
                        </button>
                    );
                })}
            </div>
            <p className="mt-2 text-[11px] font-medium text-neutral-500">
                {total > 0 ? `${total} vote${total === 1 ? "" : "s"} from registered buyers` : "Be the first to vote"}
                {" · "}Registered buyers only
            </p>
        </div>
    );
}
