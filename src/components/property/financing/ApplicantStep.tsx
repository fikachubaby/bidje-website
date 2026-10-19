import { ArrowLeft, ArrowRight, Check, FileText, Info, ShieldCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    APPLICANT_TYPES,
    APPLICANT_TYPE_META,
    COMPANY_KINDS,
    COMPANY_KIND_LABELS,
    SCREENING_FEES,
    requiredDocuments,
    screeningFee,
    type ApplicantType,
    type CompanyKind,
} from "@/constants/financing-screening";
import { APPLICANT_ICONS, PrimaryButton, SecondaryButton, StepActions, formatRM } from "./shared";

interface ApplicantStepProps {
    applicantType: ApplicantType | null;
    companyKind: CompanyKind;
    onSelect: (type: ApplicantType) => void;
    onCompanyKind: (kind: CompanyKind) => void;
    onBack: () => void;
    onContinue: () => void;
    isGuest: boolean;
    busy: boolean;
}

export function ApplicantStep({
    applicantType,
    companyKind,
    onSelect,
    onCompanyKind,
    onBack,
    onContinue,
    isGuest,
    busy,
}: ApplicantStepProps) {
    const docs = applicantType ? requiredDocuments(applicantType, companyKind) : [];

    return (
        <div className="animate-step-in space-y-6">
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-muted via-brand-light/40 to-white p-5">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-brand/30 blur-2xl" aria-hidden />
                <div className="relative flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-brand shadow-lg">
                        <ShieldCheck className="h-6 w-6" />
                    </span>
                    <div>
                        <h3 className="text-lg font-extrabold text-black">Financing Screening Required</h3>
                        <p className="mt-1 text-sm leading-relaxed text-neutral-700">
                            All purchasers using bank financing must complete Bidje&apos;s financing eligibility screening before
                            the offer can be processed. Our team reviews your documents and performs the relevant credit/CCRIS
                            assessment, subject to your consent.
                        </p>
                    </div>
                </div>
                <div className="relative mt-4 grid grid-cols-2 gap-2">
                    <FeeChip label="Individual" amount={SCREENING_FEES.individual} />
                    <FeeChip label="Company" amount={SCREENING_FEES.company} />
                </div>
                <p className="relative mt-3 flex items-center gap-1.5 text-xs text-neutral-600">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    Screening fee is non-refundable once assessment has commenced.
                </p>
            </section>

            <section>
                <h4 className="text-sm font-bold text-black">Who is applying?</h4>
                <p className="mt-0.5 text-xs text-neutral-500">We&apos;ll tailor the document checklist to you.</p>
                <div className="mt-3 grid grid-cols-2 gap-3" role="radiogroup" aria-label="Applicant type">
                    {APPLICANT_TYPES.map((type) => {
                        const { icon: Icon, tint } = APPLICANT_ICONS[type];
                        const selected = applicantType === type;
                        return (
                            <button
                                key={type}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => onSelect(type)}
                                className={cn(
                                    "group relative flex flex-col items-start gap-2 rounded-2xl border-2 p-3.5 text-left transition-all active:scale-[0.97] sm:p-4",
                                    selected
                                        ? "border-brand bg-brand-muted/40 shadow-md shadow-brand/20"
                                        : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm"
                                )}
                            >
                                {selected && (
                                    <span className="absolute right-2.5 top-2.5 grid h-5 w-5 animate-pop place-items-center rounded-full bg-black text-brand">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                )}
                                <span
                                    className={cn(
                                        "grid h-10 w-10 place-items-center rounded-xl transition-transform group-hover:scale-110",
                                        tint
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                                <span className="text-sm font-bold leading-tight text-black">{APPLICANT_TYPE_META[type].label}</span>
                                <span className="hidden text-xs leading-snug text-neutral-500 sm:block">{APPLICANT_TYPE_META[type].blurb}</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-neutral-700 ring-1 ring-neutral-200">
                                    {formatRM(screeningFee(type))}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {applicantType === "company" && (
                    <div className="mt-3 animate-step-in rounded-2xl bg-neutral-100 p-1" role="radiogroup" aria-label="Company type">
                        <div className="grid grid-cols-2 gap-1">
                            {COMPANY_KINDS.map((kind) => (
                                <button
                                    key={kind}
                                    type="button"
                                    role="radio"
                                    aria-checked={companyKind === kind}
                                    onClick={() => onCompanyKind(kind)}
                                    className={cn(
                                        "rounded-xl px-3 py-2 text-xs font-semibold transition-all",
                                        companyKind === kind ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
                                    )}
                                >
                                    {COMPANY_KIND_LABELS[kind]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            {applicantType && (
                <section key={`${applicantType}-${companyKind}`} className="animate-step-in rounded-2xl border border-dashed border-neutral-300 p-4">
                    <p className="flex items-center gap-2 text-sm font-bold text-black">
                        <FileText className="h-4 w-4 text-neutral-500" />
                        You&apos;ll need {docs.filter((d) => !d.optional).length} documents
                    </p>
                    <ul className="mt-3 space-y-2">
                        {docs.map((d, i) => (
                            <li
                                key={d.key}
                                className="flex animate-step-in items-start gap-2 text-sm text-neutral-700"
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-dark" />
                                <span>
                                    {d.label}
                                    {d.hint && <span className="text-neutral-400"> · {d.hint}</span>}
                                    {d.optional && <span className="ml-1 text-xs font-semibold text-neutral-400">(optional)</span>}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <StepActions>
                <SecondaryButton onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" /> Change method
                </SecondaryButton>
                <PrimaryButton onClick={onContinue} disabled={!applicantType} busy={busy}>
                    {isGuest ? (
                        <>
                            <UserPlus className="h-4 w-4" /> Create account to continue
                        </>
                    ) : (
                        <>
                            Continue to screening <ArrowRight className="h-4 w-4" />
                        </>
                    )}
                </PrimaryButton>
            </StepActions>
            {isGuest && (
                <p className="-mt-3 text-center text-xs text-neutral-500">
                    Screening is tied to your Bidje account. Your offer details are saved and you&apos;ll come right back here.
                </p>
            )}
        </div>
    );
}

function FeeChip({ label, amount }: { label: string; amount: number }) {
    return (
        <div className="rounded-2xl bg-white/80 px-3 py-2.5 ring-1 ring-black/5 backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="text-xl font-black text-black">{formatRM(amount)}</p>
        </div>
    );
}
