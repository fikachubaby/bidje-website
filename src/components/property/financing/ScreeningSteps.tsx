import { useState } from "react";
import {
    AlertTriangle,
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    CreditCard,
    Hourglass,
    Lock,
    PartyPopper,
    RefreshCw,
    RotateCcw,
    SearchCheck,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    APPLICANT_TYPE_META,
    COMPANY_KIND_LABELS,
    CONSENT_DECLARATION,
    SCREENING_STATUS_META,
    type FinancingScreening,
} from "@/constants/financing-screening";
import { APPLICANT_ICONS, PrimaryButton, SecondaryButton, StepActions, formatRM } from "./shared";

export function ConsentStep({
    screening,
    busy,
    onBack,
    onAgree,
}: {
    screening: FinancingScreening;
    busy: boolean;
    onBack: () => void;
    onAgree: () => void;
}) {
    const [ticks, setTicks] = useState({ assessment: false, fee: false, bankDecision: false });
    const allTicked = ticks.assessment && ticks.fee && ticks.bankDecision;
    const items: { key: keyof typeof ticks; label: string }[] = [
        { key: "assessment", label: "I consent to the financing eligibility assessment." },
        { key: "fee", label: `I agree to the ${formatRM(screening.feeAmount)} screening fee, which is non-refundable once assessment has commenced.` },
        { key: "bankDecision", label: "I understand that financing approval remains subject to the bank's assessment." },
    ];

    return (
        <div className="animate-step-in space-y-5">
            <div>
                <h3 className="text-lg font-extrabold text-black">Consent &amp; Declaration</h3>
                <p className="mt-0.5 text-xs text-neutral-500">Please read carefully. This authorises the credit check.</p>
            </div>
            <blockquote className="rounded-2xl border-l-4 border-brand bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">
                {CONSENT_DECLARATION}
            </blockquote>
            <div className="space-y-2.5">
                {items.map(({ key, label }) => (
                    <label
                        key={key}
                        className={cn(
                            "flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition-colors",
                            ticks[key] ? "border-brand bg-brand-muted/30" : "border-neutral-200 hover:border-neutral-300"
                        )}
                    >
                        <input
                            type="checkbox"
                            checked={ticks[key]}
                            onChange={(e) => setTicks((t) => ({ ...t, [key]: e.target.checked }))}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-black"
                        />
                        <span className="text-sm leading-relaxed text-neutral-800">{label}</span>
                    </label>
                ))}
            </div>
            <StepActions>
                <SecondaryButton onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Documents
                </SecondaryButton>
                <PrimaryButton onClick={onAgree} disabled={!allTicked} busy={busy}>
                    Agree &amp; continue <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
            </StepActions>
        </div>
    );
}

export function PaymentStep({
    screening,
    busy,
    returnedFromGateway,
    onPay,
    onRefresh,
}: {
    screening: FinancingScreening;
    busy: boolean;
    returnedFromGateway: boolean;
    onPay: () => void;
    onRefresh: () => void;
}) {
    const { icon: Icon, tint } = APPLICANT_ICONS[screening.applicantType];
    return (
        <div className="animate-step-in space-y-5">
            <div>
                <h3 className="text-lg font-extrabold text-black">Pay screening fee</h3>
                <p className="mt-0.5 text-xs text-neutral-500">Documents and consent received. One last step.</p>
            </div>

            {returnedFromGateway && (
                <div className="flex items-start gap-3 rounded-2xl bg-sky-50 p-4 text-sm text-sky-900">
                    <Hourglass className="mt-0.5 h-4 w-4 shrink-0 animate-pulse" />
                    <div className="flex-1">
                        <p className="font-semibold">Confirming your payment…</p>
                        <p className="text-xs text-sky-800">This usually takes a few seconds. If you cancelled, you can pay again below.</p>
                    </div>
                    <button type="button" onClick={onRefresh} className="rounded-lg p-1.5 hover:bg-sky-100" aria-label="Check again">
                        <RefreshCw className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-neutral-200">
                <div className="flex items-center gap-3 p-4">
                    <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tint)}>
                        <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-black">Financing eligibility screening</p>
                        <p className="text-xs text-neutral-500">
                            {APPLICANT_TYPE_META[screening.applicantType].label}
                            {screening.companyKind && ` · ${COMPANY_KIND_LABELS[screening.companyKind]}`}
                        </p>
                    </div>
                </div>
                <div className="flex items-end justify-between border-t border-dashed border-neutral-200 bg-neutral-50 px-4 py-3">
                    <span className="text-sm font-semibold text-neutral-600">Total</span>
                    <span className="text-2xl font-black text-black">{formatRM(screening.feeAmount)}</span>
                </div>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                <Lock className="h-3.5 w-3.5" /> Secure checkout by Fiuu. Non-refundable once assessment has commenced.
            </p>

            <StepActions>
                <PrimaryButton onClick={onPay} busy={busy}>
                    <CreditCard className="h-4 w-4" /> Pay {formatRM(screening.feeAmount)} securely
                </PrimaryButton>
            </StepActions>
        </div>
    );
}

const TONE: Record<string, string> = {
    blue: "bg-sky-100 text-sky-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
};

export function ReviewStatusStep({
    screening,
    onRefresh,
    onStartOver,
    onBackToOffer,
    children,
    busy,
    onResubmit,
    canResubmit,
}: {
    screening: FinancingScreening;
    onRefresh: () => void;
    onStartOver: () => void;
    onBackToOffer: () => void;
    onResubmit: () => void;
    canResubmit: boolean;
    busy: boolean;
    children?: React.ReactNode;
}) {
    const meta = SCREENING_STATUS_META[screening.status];
    const needsDocs = screening.status === "additional_documents_required";
    const rejected = screening.status === "not_eligible";
    const StatusIcon = rejected ? XCircle : needsDocs ? AlertTriangle : SearchCheck;

    return (
        <div className="animate-step-in space-y-5">
            <div className="flex flex-col items-center rounded-3xl bg-neutral-50 px-5 py-6 text-center">
                <span className={cn("relative grid h-16 w-16 place-items-center rounded-full", TONE[meta.tone])}>
                    {screening.status === "under_review" && (
                        <span className="absolute inset-0 animate-ping rounded-full bg-sky-200 opacity-60" aria-hidden />
                    )}
                    <StatusIcon className="relative h-8 w-8" />
                </span>
                <span className={cn("mt-4 rounded-full px-3 py-1 text-xs font-bold", TONE[meta.tone])}>{meta.label}</span>
                <h3 className="mt-3 text-lg font-extrabold text-black">
                    {rejected
                        ? "We couldn't confirm eligibility"
                        : needsDocs
                          ? "A few more documents, please"
                          : "Our team is reviewing your screening"}
                </h3>
                <p className="mt-1 max-w-sm text-sm text-neutral-600">
                    {rejected
                        ? "Further review is required before a financed offer can proceed. You can still offer with another purchase method, or contact us to discuss."
                        : needsDocs
                          ? "Upload what's requested below, then send it back for review. No extra fee."
                          : "Payment received. We'll notify you once the assessment is done, usually within 1–3 working days."}
                </p>
                {screening.staffRemark && (
                    <p className="mt-4 w-full rounded-2xl bg-white p-3 text-left text-sm text-neutral-700 ring-1 ring-neutral-200">
                        <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-400">Note from Bidje</span>
                        {screening.staffRemark}
                    </p>
                )}
            </div>

            {needsDocs && children}

            <StepActions>
                {rejected ? (
                    <>
                        <SecondaryButton onClick={onBackToOffer}>
                            <ArrowLeft className="h-4 w-4" /> Change method
                        </SecondaryButton>
                        <PrimaryButton onClick={onStartOver}>
                            <RotateCcw className="h-4 w-4" /> Start new screening
                        </PrimaryButton>
                    </>
                ) : needsDocs ? (
                    <PrimaryButton onClick={onResubmit} disabled={!canResubmit} busy={busy}>
                        Send for review <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                ) : (
                    <>
                        <SecondaryButton onClick={onBackToOffer}>
                            <ArrowLeft className="h-4 w-4" /> Back to offer
                        </SecondaryButton>
                        <PrimaryButton onClick={onRefresh} busy={busy}>
                            <RefreshCw className="h-4 w-4" /> Check status
                        </PrimaryButton>
                    </>
                )}
            </StepActions>
        </div>
    );
}

const CONFETTI = ["#ffd000", "#000000", "#10b981", "#38bdf8", "#f97316", "#a78bfa"];

export function PassedStep({ screening, onContinue }: { screening: FinancingScreening; onContinue: () => void }) {
    return (
        <div className="animate-step-in space-y-5">
            <div className="relative flex flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-50 to-white px-5 py-8 text-center">
                {Array.from({ length: 18 }).map((_, i) => (
                    <span
                        key={i}
                        aria-hidden
                        className="animate-confetti absolute top-0 h-2.5 w-1.5 rounded-sm"
                        style={{
                            left: `${(i * 53) % 100}%`,
                            background: CONFETTI[i % CONFETTI.length],
                            animationDelay: `${(i % 6) * 120}ms`,
                        }}
                    />
                ))}
                <span className="grid h-20 w-20 animate-pop place-items-center rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10" />
                </span>
                <p className="mt-5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <PartyPopper className="h-4 w-4" /> Eligible to proceed
                </p>
                <h3 className="mt-2 text-xl font-black text-black">Financing Screening Passed</h3>
                <p className="mt-2 max-w-sm text-sm text-neutral-600">
                    You may now proceed to submit your offer for this property.
                </p>
                {screening.validUntil && (
                    <p className="mt-3 text-xs text-neutral-500">
                        Valid for new offers until{" "}
                        {new Date(screening.validUntil).toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                )}
            </div>
            <p className="text-center text-xs text-neutral-500">
                Preliminary screening only. This is not a loan approval. Final financing is subject to the bank&apos;s assessment.
            </p>
            <StepActions>
                <PrimaryButton onClick={onContinue}>
                    Continue to submit offer <ArrowRight className="h-4 w-4" />
                </PrimaryButton>
            </StepActions>
        </div>
    );
}
