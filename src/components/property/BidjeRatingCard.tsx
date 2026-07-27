interface BidjeRatingCardProps {
  score: number;
}

function getRatingLabel(score: number): string {
  if (score >= 80) return "Good Buy";
  if (score >= 65) return "Fair Value";
  return "Review Carefully";
}

export function BidjeRatingCard({ score }: BidjeRatingCardProps) {
  const label = getRatingLabel(score);

  return (
    <div className="rounded-2xl border border-brand/20 bg-brand-muted/40 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">
            Bidje Rating
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-black">{score}</span>
            <span className="text-lg font-medium text-neutral-500">/ 100</span>
          </div>
          <p className="mt-1 text-base font-bold text-black">{label}</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2.5 overflow-hidden rounded-full bg-white/80">
          <div
            className="h-full rounded-full bg-brand transition-all"
            style={{ width: `${Math.min(score, 100)}%` }}
          />
        </div>
      </div>

      <button
        type="button"
        className="mt-4 text-sm font-semibold text-neutral-700 underline-offset-2 transition-colors hover:text-black hover:underline"
      >
        How is this calculated?
      </button>
    </div>
  );
}
