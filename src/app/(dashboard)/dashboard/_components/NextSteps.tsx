import { ArrowRight, CheckCircle2, FileUp, Search, ShieldAlert } from "lucide-react";
import type { OfferHistoryItem } from "@/types/offer";
import type { SubscriptionView } from "@/lib/subscriptions/plan";

export type DashboardTab = "overview" | "deals" | "offers" | "billing";

interface Step {
    key: string;
    icon: React.ReactNode;
    title: string;
    detail: string;
    action: string;
    tab: DashboardTab;
    tone: "urgent" | "normal";
}

/** Works out what the subscriber should do next, so they never have to hunt for it. */
export function buildNextSteps(offers: OfferHistoryItem[], sub: SubscriptionView | null): Step[] {
    const steps: Step[] = [];

    if (sub && (sub.status === "none" || sub.status === "expired" || sub.status === "cancelled")) {
        steps.push({
            key: "subscribe",
            icon: <ShieldAlert className="h-5 w-5" />,
            title: "Unlock full property details",
            detail: "Subscribe to see owner addresses and make offers.",
            action: "Subscribe",
            tab: "billing",
            tone: "urgent",
        });
    } else if (sub?.status === "past_due") {
        steps.push({
            key: "past_due",
            icon: <ShieldAlert className="h-5 w-5" />,
            title: "Payment didn't go through",
            detail: "Update your payment to keep access.",
            action: "Fix billing",
            tab: "billing",
            tone: "urgent",
        });
    }

    const missingDocs = offers.filter((o) => !o.icDocumentUrl && !/reject|cancel|withdraw/i.test(o.status));
    if (missingDocs.length) {
        steps.push({
            key: "docs",
            icon: <FileUp className="h-5 w-5" />,
            title: `${missingDocs.length} offer${missingDocs.length > 1 ? "s need" : " needs"} your documents`,
            detail: "Upload your IC so we can verify and send your offer to the owner.",
            action: "Upload now",
            tab: "offers",
            tone: "urgent",
        });
    }

    if (!offers.length) {
        steps.push({
            key: "first_offer",
            icon: <Search className="h-5 w-5" />,
            title: "Make your first offer",
            detail: "Browse below-market deals and pick one you like.",
            action: "Browse deals",
            tab: "deals",
            tone: "normal",
        });
    }

    return steps;
}

export function NextSteps({ steps, onGo }: { steps: Step[]; onGo: (tab: DashboardTab) => void }) {
    if (!steps.length) {
        return (
            <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                You&apos;re all caught up. We&apos;ll let you know when an owner responds.
            </div>
        );
    }
    return (
        <div className="grid gap-3 md:grid-cols-2">
            {steps.map((s) => (
                <button
                    key={s.key}
                    type="button"
                    onClick={() => onGo(s.tab)}
                    className={
                        s.tone === "urgent"
                            ? "flex items-center gap-3 rounded-3xl border-2 border-black bg-brand p-4 text-left shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5"
                            : "flex items-center gap-3 rounded-3xl border border-neutral-200 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                    }
                >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-brand">{s.icon}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black">{s.title}</span>
                        <span className="block text-xs text-neutral-700">{s.detail}</span>
                    </span>
                    <span className="hidden shrink-0 items-center gap-1 text-xs font-black sm:flex">
                        {s.action} <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                </button>
            ))}
        </div>
    );
}
