export type LegalStageStatus = "pending" | "in_progress" | "blocked" | "completed" | "waived";

export type LegalStageCategory =
    | "offer" | "spa" | "stamping" | "financing" | "consent" | "registration" | "completion";

export const STAGE_CATEGORY_ORDER: LegalStageCategory[] = [
    "offer", "spa", "consent", "stamping", "financing", "registration", "completion",
];

export const STAGE_CATEGORY_LABELS: Record<LegalStageCategory, string> = {
    offer: "Offer & Booking",
    spa: "SPA Drafting/Signing",
    consent: "Consent / Clearance",
    stamping: "Stamping",
    financing: "Loan Financing",
    registration: "Land Office Registration",
    completion: "Completion",
};

export interface LegalCaseStage {
    id: string;
    offerId: string;
    stageName: string;
    stageOrder: number;
    stageCategory: LegalStageCategory;
    status: LegalStageStatus;
    startedAt?: string | null;
    completedAt?: string | null;
    expectedBy?: string | null;
    blockedReason?: string | null;
    assignedTo?: string | null;
    legalFirmId?: string | null;
    notes?: string | null;
    updatedAt: string;
    propertyTitle?: string;
    buyerName?: string;
    legalFirmName?: string;
    aiSummary?: string | null;
    aiSummaryGeneratedAt?: string | null;
}
