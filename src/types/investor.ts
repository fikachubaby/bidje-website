export type InvestorStage = "legal" | "renovation" | "for_sale" | "sold" | "completed";
export type MilestoneCategory = "legal" | "renovation" | "sales";
export type UpdateCategory = MilestoneCategory | "finance" | "general";

export interface InvestorMilestone {
    id: string;
    category: MilestoneCategory;
    label: string;
    sortOrder: number;
    done: boolean;
    doneAt?: string | null;
}

export interface InvestorUpdate {
    id: string;
    category: UpdateCategory;
    message: string;
    visibleToInvestor: boolean;
    createdAt: string;
}

export interface InvestorPropertyReminder {
    id: string;
    title: string;
    dueDate: string;
    status: string;
    channel: string;
    lastSentAt?: string | null;
}

export interface InvestorProperty {
    id: string;
    investorId: string;
    propertyId?: string | null;
    refNo?: string | null;
    address: string;
    state?: string | null;
    dateSigned?: string | null;
    dateSignedNote?: string | null;
    stage: InvestorStage;
    purchasePrice: number;
    legalCost: number;
    renovationCost: number;
    otherCost: number;
    sellingCost: number;
    targetPrice: number;
    highestOffer: number;
    expectedCompletion?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    milestones: InvestorMilestone[];
    updates: InvestorUpdate[];
    reminders: InvestorPropertyReminder[];
}

export type InvestorPropertyInput = Partial<
    Omit<InvestorProperty, "id" | "createdAt" | "updatedAt" | "milestones" | "updates" | "reminders">
> & { investorId: string; address: string };

export interface InvestorSummary {
    id: string;
    fullName: string | null;
    email: string;
    phone: string | null;
    role: string;
    propertyCount: number;
}
