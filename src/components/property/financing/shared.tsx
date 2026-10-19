import type { ReactNode } from "react";
import { BriefcaseBusiness, Building2, Check, Landmark, Loader2, Store, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ApplicantType } from "@/constants/financing-screening";

export const APPLICANT_ICONS: Record<ApplicantType, { icon: LucideIcon; tint: string }> = {
    government_servant: { icon: Landmark, tint: "bg-sky-100 text-sky-700" },
    salaried: { icon: BriefcaseBusiness, tint: "bg-violet-100 text-violet-700" },
    self_employed: { icon: Store, tint: "bg-orange-100 text-orange-700" },
    company: { icon: Building2, tint: "bg-emerald-100 text-emerald-700" },
};

export const SCREENING_STEPS = ["Applicant", "Documents", "Consent", "Payment", "Review"] as const;

/** Progress across the screening journey. Labels collapse to the current one on small screens. */
export function ScreeningStepper({ current }: { current: number }) {
    return (
        <ol className="mb-5 flex items-center gap-1.5" aria-label="Screening progress">
            {SCREENING_STEPS.map((label, i) => {
                const done = i < current;
                const active = i === current;
                return (
                    <li key={label} className="flex flex-1 flex-col items-center gap-1.5" aria-current={active ? "step" : undefined}>
                        <div className="flex w-full items-center gap-1.5">
                            <span
                                className={cn(
                                    "grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition-colors",
                                    done && "bg-black text-brand",
                                    active && "bg-brand text-black ring-4 ring-brand/25",
                                    !done && !active && "bg-neutral-100 text-neutral-400"
                                )}
                            >
                                {done ? <Check className="h-3.5 w-3.5 animate-pop" strokeWidth={3} /> : i + 1}
                            </span>
                            {i < SCREENING_STEPS.length - 1 && (
                                <span className={cn("h-0.5 flex-1 rounded-full", done ? "bg-black" : "bg-neutral-200")} />
                            )}
                        </div>
                        <span
                            className={cn(
                                "self-start text-[10px] font-semibold uppercase tracking-wide",
                                active ? "text-black" : "hidden text-neutral-400 sm:block"
                            )}
                        >
                            {label}
                        </span>
                    </li>
                );
            })}
        </ol>
    );
}

/** Bottom action bar that stays visible while the step content scrolls. */
export function StepActions({ children }: { children: ReactNode }) {
    return (
        <div className="sticky bottom-0 -mx-1 mt-6 flex flex-col-reverse gap-3 border-t border-neutral-100 bg-white px-1 pt-4 sm:flex-row">
            {children}
        </div>
    );
}

export function PrimaryButton({
    children,
    busy,
    disabled,
    onClick,
}: {
    children: ReactNode;
    busy?: boolean;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-brand py-3.5 text-sm font-bold text-black transition-all hover:bg-brand-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
}

export function SecondaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 py-3.5 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
        >
            {children}
        </button>
    );
}

export const formatRM = (n: number) => `RM${n.toLocaleString("en-MY")}`;
