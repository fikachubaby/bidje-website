"use client";

import { useState } from "react";
import { getRatingLabel } from "@/lib/utils/score";
import { PriceOpinion } from "@/components/property/PriceOpinion";
import { usePropertySentiment } from "@/hooks/usePropertySentiment";
import { hasEnoughSentiment, summariseSentiment } from "@/lib/score/sentiment";
import { SENTIMENT_MIN_RESPONSES, type BidjeScoreBreakdown } from "@/lib/score/bidjeScore";
import type { PropertySentiment } from "@/types/property";

interface BidjeRatingCardProps {
  propertyId: string;
  score?: number;
  breakdown?: BidjeScoreBreakdown;
  sentiment?: PropertySentiment;
}

const PILLARS = [
  { key: "bmvScore", flag: "bmv", label: "Below market value", max: 35, missing: "No valuation or comparables yet" },
  { key: "yieldScore", flag: "yield", label: "Rental yield", max: 30, missing: "Rental estimate not available" },
  { key: "legalScore", flag: null, label: "Legal risk", max: 20, missing: "" },
  { key: "demandScore", flag: "demand", label: "Buyer demand", max: 15, missing: `Needs ${SENTIMENT_MIN_RESPONSES}+ buyer responses` },
] as const;

export function BidjeRatingCard({ propertyId, score, breakdown, sentiment: initialSentiment }: BidjeRatingCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const sentiment = usePropertySentiment(propertyId, initialSentiment);
  const summary = summariseSentiment(sentiment);
  const rated = score != null;

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand-muted/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Bidje Rating
          </p>
          {rated ? (
            <>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-black">{score}</span>
                <span className="text-lg font-medium text-neutral-500">/ 100</span>
              </div>
              <p className="mt-1 text-base font-bold text-black">{getRatingLabel(score)}</p>
            </>
          ) : (
            <p className="mt-2 text-base font-bold text-neutral-600">Not rated yet</p>
          )}
        </div>
      </div>

      {rated && (
        <div className="mt-5">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${Math.min(score, 100)}%` }}
            />
          </div>
        </div>
      )}

      {summary && (
        <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          {summary}
        </p>
      )}

      {breakdown && (
        <>
          <button
            type="button"
            onClick={() => setShowBreakdown((v) => !v)}
            aria-expanded={showBreakdown}
            className="mt-4 text-sm font-semibold text-neutral-700 underline-offset-2 transition-colors hover:text-black hover:underline"
          >
            {showBreakdown ? "Hide breakdown" : "How is this calculated?"}
          </button>

          {showBreakdown && (
            <ul className="mt-3 space-y-2.5">
              {PILLARS.map((p) => {
                const value = breakdown[p.key];
                const estimated = p.flag != null && breakdown.estimated.includes(p.flag);
                return (
                  <li key={p.key}>
                    <div className="flex justify-between text-xs font-bold text-neutral-700">
                      <span>{p.label}</span>
                      <span>
                        {value} / {p.max}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/80">
                      <div
                        className={estimated ? "h-full rounded-full bg-neutral-300" : "h-full rounded-full bg-brand"}
                        style={{ width: `${(value / p.max) * 100}%` }}
                      />
                    </div>
                    {estimated && <p className="mt-0.5 text-[11px] text-neutral-500">{p.missing} — scored at half marks</p>}
                  </li>
                );
              })}
              {!hasEnoughSentiment(sentiment) && (
                <li className="text-[11px] text-neutral-500">Demand updates as registered buyers vote and make offers.</li>
              )}
            </ul>
          )}
        </>
      )}

      <PriceOpinion propertyId={propertyId} sentiment={sentiment} />
    </div>
  );
}
