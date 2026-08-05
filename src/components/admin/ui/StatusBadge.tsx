import { cn } from "@/lib/utils";
import type { OfferStatus, PropertyStatus } from "@/types/property";

type BadgeStatus = PropertyStatus | OfferStatus;

const styles: Record<BadgeStatus, string> = {
  Published: "bg-emerald-100 text-emerald-800",
  Accepted: "bg-emerald-100 text-emerald-800",
  Draft: "bg-amber-100 text-amber-800",
  Pending: "bg-amber-100 text-amber-800",
  "Under Offer": "bg-blue-100 text-blue-800",
  Sold: "bg-neutral-200 text-neutral-700",
  Rejected: "bg-red-100 text-red-800",
  Active: "bg-emerald-100 text-emerald-800",
  Archived: "bg-neutral-200 text-neutral-700",
};

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide",
        styles[status],
        className
      )}
    >
      {status}
    </span>
  );
}
