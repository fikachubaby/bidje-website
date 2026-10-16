import type { InvestorProperty } from "@/types/investor";

export const INVESTOR_PROPERTY_SELECT = `
  *,
  investor_property_milestones (*),
  investor_property_updates (*),
  reminders (id, title, due_date, status, channel, last_sent_at)
`;

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapInvestorProperty(r: any, { investorView = false } = {}): InvestorProperty {
    const updates = (r.investor_property_updates ?? [])
        .filter((u: any) => !investorView || u.visible_to_investor)
        .map((u: any) => ({
            id: u.id,
            category: u.category,
            message: u.message,
            visibleToInvestor: u.visible_to_investor,
            createdAt: u.created_at,
        }))
        .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

    return {
        id: r.id,
        investorId: r.investor_id,
        propertyId: r.property_id,
        refNo: r.ref_no,
        address: r.address,
        state: r.state,
        dateSigned: r.date_signed,
        dateSignedNote: r.date_signed_note,
        stage: r.stage,
        purchasePrice: Number(r.purchase_price ?? 0),
        legalCost: Number(r.legal_cost ?? 0),
        renovationCost: Number(r.renovation_cost ?? 0),
        otherCost: Number(r.other_cost ?? 0),
        sellingCost: Number(r.selling_cost ?? 0),
        targetPrice: Number(r.target_price ?? 0),
        highestOffer: Number(r.highest_offer ?? 0),
        expectedCompletion: r.expected_completion,
        // Admin-only fields are hidden from the investor portal.
        notes: investorView ? null : r.notes,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        aiAnalysis:
            investorView && r.ai_analysis
                ? { ...r.ai_analysis, blocker: "", next_action: "", waiting_on: "" }
                : r.ai_analysis,
        aiAnalyzedAt: r.ai_analyzed_at,
        milestones: (r.investor_property_milestones ?? [])
            .map((m: any) => ({
                id: m.id,
                category: m.category,
                label: m.label,
                sortOrder: m.sort_order,
                done: m.done,
                doneAt: m.done_at,
            }))
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder),
        updates,
        reminders: (r.reminders ?? [])
            .map((x: any) => ({
                id: x.id,
                title: x.title,
                dueDate: x.due_date,
                status: x.status,
                channel: x.channel,
                lastSentAt: x.last_sent_at,
            }))
            .sort((a: any, b: any) => a.dueDate.localeCompare(b.dueDate)),
    };
}

const FIELD_MAP: Record<string, string> = {
    investorId: "investor_id",
    propertyId: "property_id",
    refNo: "ref_no",
    address: "address",
    state: "state",
    dateSigned: "date_signed",
    dateSignedNote: "date_signed_note",
    stage: "stage",
    purchasePrice: "purchase_price",
    legalCost: "legal_cost",
    renovationCost: "renovation_cost",
    otherCost: "other_cost",
    sellingCost: "selling_cost",
    targetPrice: "target_price",
    highestOffer: "highest_offer",
    expectedCompletion: "expected_completion",
    notes: "notes",
};

/** Converts a camelCase input body to DB columns, keeping only known fields. */
export function toInvestorPropertyRow(body: Record<string, unknown>) {
    const row: Record<string, unknown> = {};
    for (const [key, col] of Object.entries(FIELD_MAP)) {
        if (key in body) row[col] = body[key] === "" ? null : body[key];
    }
    return row;
}
