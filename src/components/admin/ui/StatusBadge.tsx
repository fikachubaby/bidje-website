import { cn } from "@/lib/utils";
import type { PropertyStatus } from "@/types/property";
import type { OfferStatus } from "@/types/offer";
import type { ReminderStatus } from "@/types/reminder";

type BadgeStatus = PropertyStatus | OfferStatus | ReminderStatus;

const styles: Record<BadgeStatus, string> = {
  Published: "bg-emerald-100 text-emerald-800",
  Accepted: "bg-emerald-100 text-emerald-800",
  Draft: "bg-amber-100 text-amber-800",
  "Under Offer": "bg-blue-100 text-blue-800",
  Sold: "bg-neutral-200 text-neutral-700",
  Rejected: "bg-red-100 text-red-800",
  Archived: "bg-neutral-200 text-neutral-700",
  Submitted: "bg-neutral-100 text-neutral-700",
  "Pending Documents": "bg-amber-100 text-amber-800",
  "Under Verification": "bg-blue-100 text-blue-800",
  "Verification Rejected": "bg-red-100 text-red-800",
  Verified: "bg-teal-100 text-teal-800",
  // reminder statuses
  scheduled: "bg-blue-100 text-blue-800",
  sent: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-neutral-200 text-neutral-700",
};

const labels: Partial<Record<BadgeStatus, string>> = {
  "Pending Documents": "Pending Upload",
  "Verification Rejected": "Action Required",
  scheduled: "Scheduled",
  sent: "Sent",
  cancelled: "Cancelled",
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
      {labels[status] ?? status}
    </span>
  );
}