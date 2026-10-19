export const APPLICANT_TYPES = ["government_servant", "salaried", "self_employed", "company"] as const;
export type ApplicantType = (typeof APPLICANT_TYPES)[number];

export const COMPANY_KINDS = ["sdn_bhd", "enterprise"] as const;
export type CompanyKind = (typeof COMPANY_KINDS)[number];

export const SCREENING_STATUSES = [
    "awaiting_documents",
    "payment_pending",
    "under_review",
    "additional_documents_required",
    "eligible",
    "not_eligible",
] as const;
export type ScreeningStatus = (typeof SCREENING_STATUSES)[number];

/** Statuses only staff may set after review. */
export const REVIEW_DECISIONS = ["additional_documents_required", "eligible", "not_eligible"] as const;
export type ReviewDecision = (typeof REVIEW_DECISIONS)[number];

export const SCREENING_FEES = { individual: 88, company: 158 } as const;

export function screeningFee(type: ApplicantType) {
    return type === "company" ? SCREENING_FEES.company : SCREENING_FEES.individual;
}

/** Days an "eligible" result can be reused for new offers. */
export const SCREENING_VALID_DAYS = 90;
/** Days after a decision before uploaded documents are deleted. */
export const SCREENING_DOCUMENT_RETENTION_DAYS = 90;

export const CONSENT_VERSION = "2026-10-20";

export const CONSENT_DECLARATION =
    "I confirm that the information and documents provided are true and complete. I authorise Bidje and/or its appointed financing or credit-assessment service providers to review my financial information and conduct relevant credit eligibility checks, including CCRIS-related assessment where lawfully permitted and subject to the necessary consent/authorisation. I understand that passing the screening does not constitute a loan approval or guarantee financing from any bank or financial institution.";

export const APPLICANT_TYPE_META: Record<ApplicantType, { label: string; blurb: string }> = {
    government_servant: { label: "Government Servant", blurb: "Civil service or GLC payroll" },
    salaried: { label: "Salaried Employee", blurb: "Private-sector monthly salary" },
    self_employed: { label: "Business Owner / Self-Employed", blurb: "Freelance, sole trader or own business" },
    company: { label: "Company", blurb: "Buying under a Sdn Bhd or enterprise" },
};

export const COMPANY_KIND_LABELS: Record<CompanyKind, string> = {
    sdn_bhd: "Sdn Bhd",
    enterprise: "Enterprise / Sole Proprietorship",
};

export interface RequiredDocument {
    key: string;
    label: string;
    hint?: string;
    optional?: boolean;
}

const IC: RequiredDocument = { key: "ic", label: "IC (front & back)", hint: "Upload both sides" };

export function requiredDocuments(type: ApplicantType, companyKind?: CompanyKind | null): RequiredDocument[] {
    switch (type) {
        case "government_servant":
            return [
                IC,
                { key: "employment_letter", label: "Employment confirmation letter" },
                { key: "salary_slips", label: "Latest 3 months salary slips" },
                { key: "bank_statements", label: "Latest 3 months bank statements", hint: "Showing salary credit" },
            ];
        case "salaried":
            return [
                IC,
                { key: "salary_slips", label: "Latest 3 months salary slips" },
                { key: "employment_letter", label: "Employment confirmation letter", hint: "From your employer" },
                { key: "bank_statements", label: "Bank statements", hint: "Showing salary credit" },
                { key: "epf_statement", label: "Latest EPF statement", hint: "Supports employment history" },
            ];
        case "self_employed":
            return [
                IC,
                { key: "bank_statements", label: "Latest 6 months bank statements" },
                { key: "tax_return", label: "Latest income-tax return", hint: "Form B / BE, as applicable" },
                { key: "ssm", label: "SSM registration documents" },
                { key: "business_financials", label: "Business financial statements", hint: "If available", optional: true },
            ];
        case "company":
            return [
                { key: "company_bank_statements", label: "Company bank statements", hint: "Latest 6 months" },
                companyKind === "enterprise"
                    ? { key: "pnl_balance_sheet", label: "Profit & loss and balance sheet" }
                    : { key: "audited_financials", label: "Audited financial statements", hint: "Latest 2 years" },
                {
                    key: "company_tax",
                    label: "Company tax returns & payment receipts",
                    hint: "Income-tax returns / e-filing records, latest 2 years",
                },
            ];
    }
}

export function missingRequiredDocuments(
    type: ApplicantType,
    companyKind: CompanyKind | null | undefined,
    uploadedKeys: string[]
) {
    const have = new Set(uploadedKeys);
    return requiredDocuments(type, companyKind).filter((d) => !d.optional && !have.has(d.key));
}

export const SCREENING_STATUS_META: Record<ScreeningStatus, { label: string; tone: "neutral" | "amber" | "blue" | "green" | "red" }> = {
    awaiting_documents: { label: "Awaiting documents", tone: "neutral" },
    payment_pending: { label: "Payment pending", tone: "amber" },
    under_review: { label: "Under review", tone: "blue" },
    additional_documents_required: { label: "Additional documents required", tone: "amber" },
    eligible: { label: "Eligible to proceed", tone: "green" },
    not_eligible: { label: "Not eligible / further review required", tone: "red" },
};

export const SCREENING_DOCUMENT_BUCKET = "financing-documents";
export const MAX_SCREENING_FILE_BYTES = 10 * 1024 * 1024;
export const SCREENING_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/heic"];

export interface ScreeningDocument {
    id: string;
    docKey: string;
    fileName: string;
    sizeBytes: number | null;
    createdAt: string;
}

export interface FinancingScreening {
    id: string;
    applicantType: ApplicantType;
    companyKind: CompanyKind | null;
    status: ScreeningStatus;
    feeAmount: number;
    feePaidAt: string | null;
    consentAt: string | null;
    staffRemark: string | null;
    validUntil: string | null;
    createdAt: string;
    documents: ScreeningDocument[];
}
