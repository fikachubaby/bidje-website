"use client";

import Link from "next/link";
import { CreditCard, Landmark, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { useFinancingScreening } from "@/hooks/useFinancingScreening";
import { APPLICANT_TYPE_META, SCREENING_STATUS_META } from "@/constants/financing-screening";

const TONE_CLASS = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
} as const;

const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
            <span className="text-neutral-500">{label}</span>
            <span className="text-right font-semibold text-black">{children}</span>
        </div>
    );
}

/** Account overview: membership, subscription and loan capability (financing screening) result. */
export function AccountSection({ email, createdAt }: { email: string; createdAt: string | null }) {
    const { subscription } = useSubscription();
    const { screening, loading } = useFinancingScreening(true);
    const meta = screening ? SCREENING_STATUS_META[screening.status] : null;

    return (
        <section id="account" className="scroll-mt-28 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="h-5 w-5" /> Account details
            </h2>

            <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="divide-y divide-neutral-100">
                    <Row label="Login email">{email || "—"}</Row>
                    <Row label="Member since">{fmtDate(createdAt)}</Row>
                    <Row label="Subscription">
                        <span className="inline-flex items-center gap-1.5">
                            <CreditCard className="h-4 w-4 text-neutral-400" />
                            {subscription?.status === "active" ? "Active" : subscription?.status === "past_due" ? "Payment issue" : "Not subscribed"}
                        </span>
                    </Row>
                    {subscription?.status === "active" && (
                        <Row label={subscription.autoRenew ? "Renews on" : "Ends on"}>{fmtDate(subscription.currentPeriodEnd)}</Row>
                    )}
                    <Row label="Billing">
                        <Link href="/dashboard?tab=billing" className="underline">Manage billing</Link>
                    </Row>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-neutral-500">
                        <Landmark className="h-4 w-4" /> Loan capability
                    </p>
                    {loading ? (
                        <p className="mt-3 text-sm text-neutral-500">Loading…</p>
                    ) : !screening || !meta ? (
                        <>
                            <p className="mt-3 text-sm font-bold">Not screened yet</p>
                            <p className="mt-1 text-xs text-neutral-500">
                                You&apos;ll be asked to complete a financing screening when you make an offer with a loan.
                            </p>
                        </>
                    ) : (
                        <>
                            <span className={cn("mt-3 inline-block rounded-full border px-3 py-1 text-xs font-bold", TONE_CLASS[meta.tone])}>
                                {meta.label}
                            </span>
                            <div className="mt-3 divide-y divide-neutral-200">
                                <Row label="Applicant type">{APPLICANT_TYPE_META[screening.applicantType].label}</Row>
                                <Row label="Started">{fmtDate(screening.createdAt)}</Row>
                                <Row label="Documents uploaded">{screening.documents.length}</Row>
                                {screening.validUntil && <Row label="Valid until">{fmtDate(screening.validUntil)}</Row>}
                            </div>
                            {screening.staffRemark && (
                                <p className="mt-3 rounded-lg bg-white p-3 text-xs text-neutral-600">
                                    <span className="font-bold text-black">Note from Bidje: </span>
                                    {screening.staffRemark}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
