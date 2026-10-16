import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/investor";
import type { InvestorProperty, InvestorPropertyReminder } from "@/types/investor";

export type UpcomingReminder = InvestorPropertyReminder & { property: InvestorProperty };

export function daysUntil(dueDate: string) {
    return Math.ceil((new Date(`${dueDate}T00:00:00`).getTime() - Date.now()) / 86400000);
}

function DueChip({ dueDate }: { dueDate: string }) {
    const d = daysUntil(dueDate);
    const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Due today" : `In ${d}d`;
    return (
        <span
            className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black",
                d < 0 ? "bg-red-600 text-white" : d <= 3 ? "bg-black text-brand" : "bg-white text-neutral-800"
            )}
        >
            {label}
        </span>
    );
}

/** Highlighted strip at the top: what needs the investor's attention, with a ringing bell. */
export function RemindersSpotlight({
    reminders,
    onOpen,
}: {
    reminders: UpcomingReminder[];
    onOpen: (propertyId: string) => void;
}) {
    if (!reminders.length) return null;
    const urgent = reminders.filter((r) => daysUntil(r.dueDate) <= 3).length;

    return (
        <section className="rounded-2xl border-2 border-black bg-brand p-4 shadow-[4px_4px_0_0_#000] sm:p-5">
            <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black">
                    <Bell className="animate-bell-ring h-5 w-5 origin-top text-brand" />
                </span>
                <div>
                    <h2 className="text-lg font-black leading-tight">
                        {reminders.length} upcoming deadline{reminders.length > 1 ? "s" : ""}
                    </h2>
                    <p className="text-xs font-semibold text-black/70">
                        {urgent ? `${urgent} due within 3 days — tap one to see the property.` : "Tap one to see the property."}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex snap-x gap-3 overflow-x-auto pb-1">
                {reminders.map((r) => (
                    <button
                        key={r.id}
                        type="button"
                        onClick={() => onOpen(r.property.id)}
                        className="w-[78vw] max-w-64 shrink-0 snap-start rounded-xl bg-white/80 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-black leading-snug">{r.title}</p>
                            <DueChip dueDate={r.dueDate} />
                        </div>
                        <p className="mt-1 truncate text-xs text-neutral-600">{r.property.address}</p>
                        <p className="mt-1 text-[11px] font-semibold text-neutral-500">{formatDate(r.dueDate)}</p>
                    </button>
                ))}
            </div>
        </section>
    );
}
