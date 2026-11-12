import type {
    ExpenseCategory,
    InvestorMilestone,
    InvestorProperty,
    InvestorStage,
    MilestoneCategory,
} from "@/types/investor";

export const MILESTONE_TEMPLATES: Record<MilestoneCategory, string[]> = {
    legal: [
        "Lawyer appointed",
        "SPA / acquisition agreement prepared",
        "Agreement signed",
        "Deposit / consideration recorded",
        "Administrator / legal representative appointed",
        "Court / authority order obtained",
        "Land Office submission",
        "Registration / title update completed",
    ],
    renovation: [
        "Contractor appointed",
        "Quotation approved",
        "Cleaning / demolition",
        "Plumbing",
        "Electrical",
        "Painting",
        "Flooring / kitchen",
        "Final cleaning & defects",
        "Final photography",
    ],
    sales: [
        "Buyer booked",
        "SPA signed",
        "Loan agreement signed",
        "Consent approval",
        "First disbursement",
        "Release title",
        "Discharge documents",
        "Transfer / charge perfected",
        "Second disbursement",
    ],
};

export const STAGE_LABELS: Record<InvestorStage, string> = {
    legal: "Legal",
    renovation: "Renovation",
    for_sale: "For Sale",
    sold: "Sold",
    completed: "Completed",
};

export const STAGE_BADGE: Record<InvestorStage, string> = {
    legal: "bg-blue-50 text-blue-700",
    renovation: "bg-amber-50 text-amber-700",
    for_sale: "bg-emerald-50 text-emerald-700",
    sold: "bg-neutral-900 text-white",
    completed: "bg-neutral-100 text-neutral-700",
};

export function defaultMilestoneRows(investorPropertyId: string) {
    return (Object.keys(MILESTONE_TEMPLATES) as MilestoneCategory[]).flatMap((category) =>
        MILESTONE_TEMPLATES[category].map((label, i) => ({
            investor_property_id: investorPropertyId,
            category,
            label,
            sort_order: i,
        }))
    );
}

export function categoryProgress(milestones: InvestorMilestone[], category: MilestoneCategory) {
    const items = milestones.filter((m) => m.category === category);
    if (!items.length) return 0;
    return Math.round((items.filter((m) => m.done).length / items.length) * 100);
}

export function overallProgress(p: InvestorProperty) {
    return Math.round(
        (categoryProgress(p.milestones, "legal") +
            categoryProgress(p.milestones, "renovation") +
            categoryProgress(p.milestones, "sales")) /
            3
    );
}

export function totalCost(p: InvestorProperty) {
    return p.purchasePrice + p.agentFee + p.legalCost + p.renovationCost + p.otherCost;
}

/** The agreed selling price once known, otherwise the target price. */
export function salePrice(p: InvestorProperty) {
    return p.sellingPrice || p.targetPrice;
}

export function projectedProfit(p: InvestorProperty) {
    const price = salePrice(p);
    return price ? price - totalCost(p) - p.sellingCost : 0;
}

/** Keys allowed in investor_properties.details (free-text transaction info). */
export const TRANSACTION_DETAIL_KEYS = [
    "lotNo", "titleNo", "mukim", "daerah",
    "lawyerPic1Name", "lawyerPic1Phone", "lawyerPic1Email",
    "lawyerPic2Name", "lawyerPic2Phone", "lawyerPic2Email",
    "contractorPic", "contractorEmail",
    "consultantPic1Name", "consultantPic1Phone", "consultantPic1Email",
    "consultantPic2Name", "consultantPic2Phone", "consultantPic2Email",
    "purchaserName", "purchaserPhone", "purchaserEmail",
    "agentName", "agentPhone", "agentEmail",
    "loanLawFirm", "loanLawyerName", "loanLawyerPhone", "loanLawyerEmail",
    "loanPicName", "loanPicPhone", "loanPicEmail",
] as const;

export type TransactionDetailKey = (typeof TRANSACTION_DETAIL_KEYS)[number];

/** Keeps only known, non-empty string keys (trimmed, capped) from an untrusted value. */
export function sanitizeTransactionDetails(value: unknown): Partial<Record<TransactionDetailKey, string>> {
    const out: Partial<Record<TransactionDetailKey, string>> = {};
    if (!value || typeof value !== "object") return out;
    const src = value as Record<string, unknown>;
    for (const key of TRANSACTION_DETAIL_KEYS) {
        const v = src[key];
        if (typeof v === "string" && v.trim()) out[key] = v.trim().slice(0, 300);
    }
    return out;
}

/** Details an investor can also edit later from the property page. */
export const INVESTOR_DETAIL_FIELDS: string[] = [
    "contractorName",
    "contractorPhone",
    "legalStart",
    "legalEnd",
    "renovationStart",
    "renovationEnd",
    "salesStart",
    "salesEnd",
];

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string }[] = [
    { key: "legal", label: "Legal" },
    { key: "agent", label: "Agent" },
    { key: "renovation", label: "Renovation" },
];

/** Planned start/end for each phase, keyed like the journey stages. */
export function phaseTimeframe(p: InvestorProperty, phase: MilestoneCategory) {
    const t = {
        legal: [p.legalStart, p.legalEnd],
        renovation: [p.renovationStart, p.renovationEnd],
        sales: [p.salesStart, p.salesEnd],
    }[phase];
    return { start: t[0] ?? null, end: t[1] ?? null };
}

export function money(n: number) {
    return "RM " + Number(n || 0).toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(iso?: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Parses Malaysian-style d/m/yy or d/m/yyyy into ISO yyyy-mm-dd; returns null otherwise. */
export function parseDmyDate(raw: string): string | null {
    const m = raw.trim().match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const STATES = [
    "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Perak", "Perlis",
    "Pulau Pinang", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan",
];

export function guessState(address: string): string | null {
    const lower = address.toLowerCase();
    if (/\bns\b|n\.\s?sembilan/.test(lower)) return "Negeri Sembilan";
    return STATES.find((s) => lower.includes(s.toLowerCase())) ?? null;
}

/** Splits one CSV/TSV line, honouring double-quoted cells. */
function splitLine(line: string, delimiter: string): string[] {
    const cells: string[] = [];
    let cur = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
            if (quoted && line[i + 1] === '"') {
                cur += '"';
                i++;
            } else quoted = !quoted;
        } else if (ch === delimiter && !quoted) {
            cells.push(cur);
            cur = "";
        } else cur += ch;
    }
    cells.push(cur);
    return cells.map((c) => c.replace(/\s+/g, " ").trim());
}

export interface ImportRow {
    refNo: string | null;
    address: string;
    state: string | null;
    dateSigned: string | null;
    dateSignedNote: string | null;
    notes: string | null;
}

/**
 * Parses rows copied from the investor spreadsheet (NO. | ADDRESS | DATE SIGNED | PROGRESS),
 * either pasted from Excel (tab-separated) or as a CSV file. Header and section rows are skipped.
 */
export function parseInvestorSheet(text: string): ImportRow[] {
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    const delimiter = lines.some((l) => l.includes("\t")) ? "\t" : ",";
    const rows: ImportRow[] = [];

    for (const line of lines) {
        const cells = splitLine(line, delimiter);
        let [no, address, signed, progress] = cells;
        // Allow sheets without the NO. column.
        if ((no ?? "").length > 10) {
            [address, signed, progress] = cells;
            no = "";
        }
        if (!address || address.length < 8) continue;
        if (/^address$/i.test(address) || /balance from/i.test(address)) continue;

        const signedRaw = (signed ?? "").trim();
        const iso = parseDmyDate(signedRaw);
        rows.push({
            refNo: no?.trim() || null,
            address: address.trim(),
            state: guessState(address),
            dateSigned: iso,
            dateSignedNote: !iso && signedRaw ? signedRaw : null,
            notes: progress?.trim() || null,
        });
    }
    return rows;
}

export interface PropertyContact {
    role: string;
    name: string;
    phone?: string;
    email?: string;
}

/** People already saved on a property's transaction details, for picking reminder receivers. */
export function propertyContacts(p: InvestorProperty): PropertyContact[] {
    const d = p.details ?? {};
    const list: PropertyContact[] = [
        { role: "Lawyer", name: p.legalFirm?.contactPerson || p.legalFirm?.name || "", phone: p.legalFirm?.phone ?? "", email: p.legalFirm?.email ?? "" },
        { role: "Lawyer PIC 1", name: d.lawyerPic1Name ?? "", phone: d.lawyerPic1Phone, email: d.lawyerPic1Email },
        { role: "Lawyer PIC 2", name: d.lawyerPic2Name ?? "", phone: d.lawyerPic2Phone, email: d.lawyerPic2Email },
        { role: "Contractor", name: d.contractorPic || p.contractorName || "", phone: p.contractorPhone ?? "", email: d.contractorEmail },
        { role: "Consultant PIC 1", name: d.consultantPic1Name ?? "", phone: d.consultantPic1Phone, email: d.consultantPic1Email },
        { role: "Consultant PIC 2", name: d.consultantPic2Name ?? "", phone: d.consultantPic2Phone, email: d.consultantPic2Email },
        { role: "Purchaser", name: d.purchaserName ?? "", phone: d.purchaserPhone, email: d.purchaserEmail },
        { role: "Agent", name: d.agentName ?? "", phone: d.agentPhone, email: d.agentEmail },
        { role: "Loan lawyer", name: d.loanLawyerName || d.loanLawFirm || "", phone: d.loanLawyerPhone, email: d.loanLawyerEmail },
        { role: "Loan lawyer PIC", name: d.loanPicName ?? "", phone: d.loanPicPhone, email: d.loanPicEmail },
    ];
    return list.filter((c) => c.phone || c.email);
}
