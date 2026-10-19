"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import type { useFinancingScreening } from "@/hooks/useFinancingScreening";
import {
    APPLICANT_TYPE_META,
    missingRequiredDocuments,
    type ApplicantType,
    type CompanyKind,
} from "@/constants/financing-screening";
import { ApplicantStep } from "./ApplicantStep";
import { DocumentChecklist } from "./DocumentChecklist";
import { ConsentStep, PassedStep, PaymentStep, ReviewStatusStep } from "./ScreeningSteps";
import { APPLICANT_ICONS, PrimaryButton, ScreeningStepper, SecondaryButton, StepActions } from "./shared";

type LocalView = "applicant" | "documents" | "consent";

interface FinancingScreeningFlowProps {
    api: ReturnType<typeof useFinancingScreening>;
    isGuest: boolean;
    initialApplicantType?: ApplicantType | null;
    initialCompanyKind?: CompanyKind | null;
    /** True right after coming back from the payment page, before the callback may have landed. */
    returnedFromGateway: boolean;
    returnPath: string;
    /** Called just before leaving for the payment page, e.g. to save the offer draft. */
    onBeforePay: () => void;
    onBackToOffer: () => void;
    onPassed: () => void;
    onRequireAccount: (applicantType: ApplicantType, companyKind: CompanyKind | null) => void;
}

/**
 * Loan purchasers' screening journey:
 * Applicant type → Documents → Consent → Pay fee → Review → Eligible → back to the offer form.
 * Server status decides where the user lands; local state only moves between the editable steps.
 */
export function FinancingScreeningFlow({
    api,
    isGuest,
    initialApplicantType,
    initialCompanyKind,
    returnedFromGateway,
    returnPath,
    onBeforePay,
    onBackToOffer,
    onPassed,
    onRequireAccount,
}: FinancingScreeningFlowProps) {
    const { screening } = api;
    const [localView, setLocalView] = useState<LocalView | null>(null);
    const [startOver, setStartOver] = useState(false);
    const [applicantType, setApplicantType] = useState<ApplicantType | null>(
        screening?.applicantType ?? initialApplicantType ?? null
    );
    const [companyKind, setCompanyKind] = useState<CompanyKind>(
        screening?.companyKind ?? initialCompanyKind ?? "sdn_bhd"
    );

    if (!isGuest && api.loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-dark" />
                <p className="mt-3 text-sm font-medium text-neutral-500">Checking your screening status…</p>
            </div>
        );
    }

    const view =
        isGuest || !screening || startOver
            ? "applicant"
            : screening.status === "eligible"
              ? "passed"
              : screening.status === "payment_pending"
                ? "payment"
                : screening.status === "awaiting_documents"
                  ? localView ?? "documents"
                  : "status";
    const stepIndex = { applicant: 0, documents: 1, consent: 2, payment: 3, status: 4, passed: 5 }[view];

    async function continueFromApplicant() {
        if (!applicantType) return;
        const kind = applicantType === "company" ? companyKind : null;
        if (isGuest) return onRequireAccount(applicantType, kind);

        const unchanged =
            screening?.status === "awaiting_documents" &&
            screening.applicantType === applicantType &&
            (screening.companyKind ?? null) === kind;
        if (unchanged || (await api.start(applicantType, kind))) {
            setStartOver(false);
            setLocalView("documents");
        }
    }

    const missing = screening
        ? missingRequiredDocuments(screening.applicantType, screening.companyKind, screening.documents.map((d) => d.docKey))
        : [];

    return (
        <div>
            <ScreeningStepper current={stepIndex} />

            {view === "applicant" && (
                <ApplicantStep
                    applicantType={applicantType}
                    companyKind={companyKind}
                    onSelect={setApplicantType}
                    onCompanyKind={setCompanyKind}
                    onBack={onBackToOffer}
                    onContinue={continueFromApplicant}
                    isGuest={isGuest}
                    busy={api.busy}
                />
            )}

            {view === "documents" && screening && (
                <div className="animate-step-in">
                    <div className="mb-4 flex items-center gap-3">
                        <ApplicantBadge type={screening.applicantType} />
                        <div className="flex-1">
                            <h3 className="text-lg font-extrabold text-black">Upload your documents</h3>
                            <p className="text-xs text-neutral-500">
                                {APPLICANT_TYPE_META[screening.applicantType].label} · PDF or photos, up to 10MB each
                            </p>
                        </div>
                    </div>
                    <DocumentChecklist
                        screening={screening}
                        uploading={api.uploading}
                        onUpload={api.upload}
                        onRemove={api.remove}
                    />
                    <StepActions>
                        <SecondaryButton onClick={() => setLocalView("applicant")}>
                            <ArrowLeft className="h-4 w-4" /> Applicant type
                        </SecondaryButton>
                        <PrimaryButton onClick={() => setLocalView("consent")} disabled={missing.length > 0 || Boolean(api.uploading)}>
                            {missing.length ? `${missing.length} more to go` : "Continue"} <ArrowRight className="h-4 w-4" />
                        </PrimaryButton>
                    </StepActions>
                </div>
            )}

            {view === "consent" && screening && (
                <ConsentStep
                    screening={screening}
                    busy={api.busy}
                    onBack={() => setLocalView("documents")}
                    onAgree={() => void api.consent()}
                />
            )}

            {view === "payment" && screening && (
                <PaymentStep
                    screening={screening}
                    busy={api.busy}
                    returnedFromGateway={returnedFromGateway}
                    onPay={() => {
                        onBeforePay();
                        void api.pay(returnPath);
                    }}
                    onRefresh={() => void api.refresh()}
                />
            )}

            {view === "status" && screening && (
                <ReviewStatusStep
                    screening={screening}
                    busy={api.busy}
                    onRefresh={() => void api.refresh()}
                    onStartOver={() => {
                        setApplicantType(screening.applicantType);
                        setStartOver(true);
                    }}
                    onBackToOffer={onBackToOffer}
                    onResubmit={() => void api.resubmit()}
                    canResubmit={missing.length === 0 && !api.uploading}
                >
                    <DocumentChecklist
                        screening={screening}
                        uploading={api.uploading}
                        onUpload={api.upload}
                        onRemove={api.remove}
                    />
                </ReviewStatusStep>
            )}

            {view === "passed" && screening && <PassedStep screening={screening} onContinue={onPassed} />}
        </div>
    );
}

function ApplicantBadge({ type }: { type: ApplicantType }) {
    const { icon: Icon, tint } = APPLICANT_ICONS[type];
    return (
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tint}`}>
            <Icon className="h-5 w-5" />
        </span>
    );
}
