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

export function projectedProfit(p: InvestorProperty) {
    return p.targetPrice ? p.targetPrice - totalCost(p) - p.sellingCost : 0;
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
