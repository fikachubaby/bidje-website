"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_CATEGORY_ORDER, STAGE_CATEGORY_LABELS } from "@/types/legal-case";
import type { LegalStageCategory } from "@/types/legal-case";

const STAGE_DESCRIPTIONS: Record<LegalStageCategory, string> = {
    offer: "Buyer's offer accepted and booking fee paid.",
    spa: "Lawyer drafts the Sale & Purchase Agreement; both parties sign.",
    consent: "Consent from the state / developer and any clearance letters.",
    stamping: "SPA and transfer documents stamped at LHDN.",
    financing: "Bank loan approved and loan documents signed.",
    registration: "Transfer of ownership registered at the Land Office.",
    completion: "Balance paid, keys handed over. The case is closed.",
};

/** Explains what the Case Tracker is, how cases arrive and how to move them. */
export function CaseTrackerGuide() {
    const [open, setOpen] = useState(true);

    return (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                aria-expanded={open}
            >
                <span className="flex items-center gap-2 text-sm font-bold text-blue-900">
                    <Info className="h-4 w-4 shrink-0" />
                    How the Case Tracker works
                </span>
                <ChevronDown className={cn("h-4 w-4 text-blue-700 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="space-y-4 border-t border-blue-200 px-4 py-4 text-sm text-neutral-700">
                    <p>
                        The Case Tracker shows every property sale that is going through the legal process, so Bidje staff can see at a
                        glance where each case is and which ones are stuck. Lawyers don&apos;t use this page; staff update it based on
                        what the legal firm reports.
                    </p>

                    <div>
                        <p className="mb-2 font-bold text-neutral-900">The flow</p>
                        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            {STAGE_CATEGORY_ORDER.map((category, index) => (
                                <li key={category} className="rounded-xl border border-blue-100 bg-white p-3">
                                    <p className="text-xs font-bold text-blue-700">Step {index + 1}</p>
                                    <p className="font-bold text-neutral-900">{STAGE_CATEGORY_LABELS[category]}</p>
                                    <p className="mt-0.5 text-xs text-neutral-500">{STAGE_DESCRIPTIONS[category]}</p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div>
                        <p className="mb-2 font-bold text-neutral-900">How to use it</p>
                        <ul className="list-disc space-y-1 pl-5">
                            <li>
                                <b>New cases appear automatically</b> in the first column when a buyer&apos;s offer is accepted in Offers.
                            </li>
                            <li>
                                <b>Drag a card to the next column</b> when that step is done. Cards only move forward one step at a time, so
                                no step is skipped.
                            </li>
                            <li>
                                <b>Flag as blocked</b> when a case is waiting on something (e.g. a missing signature) and write the reason.
                                Blocked cards turn red. Click <b>Mark unblocked</b> once it&apos;s resolved.
                            </li>
                            <li>
                                Each card shows the property, buyer, legal firm and <b>how many days</b> it has been in the current step.
                                Cards past their expected date are outlined in amber and marked <b>overdue</b>.
                            </li>
                            <li>
                                For blocked or overdue cases, click <b>Generate AI summary</b> for a short explanation of what&apos;s
                                holding the case up. Summaries are also refreshed automatically once a day.
                            </li>
                            <li>Completed cases leave the board.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
