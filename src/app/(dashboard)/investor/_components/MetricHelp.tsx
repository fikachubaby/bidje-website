"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { Modal } from "@/components/admin/ui/Modal";
import { cn } from "@/lib/utils";

export const METRIC_HELP = {
    profit: "What you're expected to earn once the properties are sold, after taking off all costs. It's an estimate before tax, and only counts properties that have a target price.",
    invested: "Everything spent on your properties so far: purchase price, agent fee, legal, renovation and other costs.",
    target: "The price we're aiming to sell your properties for. \"2 of 3 priced\" means one property doesn't have a target price yet.",
    properties: "How many properties you own, and how many are in each stage: legal, renovation or for sale.",
};

/** Small ⓘ button; opens on hover (desktop) or tap (phones). */
export function InfoTip({ text, label, dark, align = "left" }: { text: string; label: string; dark?: boolean; align?: "left" | "right" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!open) return;
        const close = (e: Event) => {
            if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("pointerdown", close);
            document.removeEventListener("keydown", close);
        };
    }, [open]);

    return (
        <span
            ref={ref}
            className="inline-flex"
            onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
            onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
        >
            <button
                type="button"
                aria-label={`What is ${label}?`}
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className={cn("rounded-full p-0.5", dark ? "text-neutral-400 hover:text-white" : "text-neutral-400 hover:text-neutral-900")}
            >
                <Info className="h-3.5 w-3.5" />
            </button>
            {open && (
                <span
                    role="tooltip"
                    // Positioned against the card (the nearest relative parent) so it never runs off-screen.
                    className={cn(
                        "absolute top-9 z-30 w-60 max-w-[calc(100vw-2rem)] rounded-xl border border-neutral-200 bg-white p-3 text-xs font-medium normal-case leading-relaxed tracking-normal text-neutral-700 shadow-lg",
                        align === "left" ? "left-3" : "right-3",
                    )}
                >
                    {text}
                </span>
            )}
        </span>
    );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
    return (
        <div className={cn("flex justify-between py-1.5", strong ? "border-t border-neutral-200 font-black" : "text-neutral-600")}>
            <span>{label}</span>
            <span>{value}</span>
        </div>
    );
}

/** Plain-language walkthrough of the dashboard figures with one worked example. */
export function HowItWorksModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
        <Modal open onClose={onClose} title="How your numbers work" description="A simple example with one property.">
            <div className="space-y-5 text-sm">
                <section>
                    <h3 className="mb-1 font-black">1. What you spent → Total invested</h3>
                    <Row label="Purchase price" value="RM 300,000" />
                    <Row label="Agent fee" value="RM 6,000" />
                    <Row label="Legal" value="RM 10,000" />
                    <Row label="Renovation" value="RM 34,000" />
                    <Row label="Total invested" value="RM 350,000" strong />
                </section>

                <section>
                    <h3 className="mb-1 font-black">2. What we aim to sell for → Target sale value</h3>
                    <Row label="Target sale price" value="RM 420,000" strong />
                </section>

                <section>
                    <h3 className="mb-1 font-black">3. What you keep → Projected profit</h3>
                    <Row label="Target sale price" value="RM 420,000" />
                    <Row label="Less total invested" value="− RM 350,000" />
                    <Row label="Less selling costs" value="− RM 15,000" />
                    <Row label="Projected profit" value="RM 55,000" strong />
                    <p className="mt-2 text-xs text-neutral-500">
                        ROI is profit ÷ total invested: RM 55,000 ÷ RM 350,000 ≈ <b>15.7%</b>. Figures are estimates before tax.
                    </p>
                </section>

                <div className="rounded-xl bg-neutral-50 p-3 text-xs text-neutral-600">
                    Your numbers update as costs come in. Add a payment under a property&apos;s <b>Expenses</b> tab with its receipt, and
                    it&apos;s included straight away.
                </div>
            </div>
        </Modal>
    );
}
