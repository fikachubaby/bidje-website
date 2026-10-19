import type { InvestorProperty } from "@/types/investor";

export const INVESTOR_PROPERTY_SELECT = `
  *,
  investor_property_milestones (*),
  investor_property_updates (*),
  reminders (id, title, due_date, status, channel, last_sent_at),
  legal_firms (id, name, contact_person, phone, email),
  financing_consultants (id, name)
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
        agentFee: Number(r.agent_fee ?? 0),
        legalCost: Number(r.legal_cost ?? 0),
        renovationCost: Number(r.renovation_cost ?? 0),
        otherCost: Number(r.other_cost ?? 0),
        sellingCost: Number(r.selling_cost ?? 0),
        targetPrice: Number(r.target_price ?? 0),
        highestOffer: Number(r.highest_offer ?? 0),
        expectedCompletion: r.expected_completion,
        contractorName: r.contractor_name,
        contractorPhone: r.contractor_phone,
        legalStart: r.legal_start,
        legalEnd: r.legal_end,
        renovationStart: r.renovation_start,
        renovationEnd: r.renovation_end,
        salesStart: r.sales_start,
        salesEnd: r.sales_end,
        // Admin-only fields are hidden from the investor portal.
        notes: investorView ? null : r.notes,
        legalFirmId: r.legal_firm_id,
        financingConsultantId: r.financing_consultant_id,
        legalFirm: r.legal_firms
            ? { name: r.legal_firms.name, contactPerson: r.legal_firms.contact_person, phone: r.legal_firms.phone, email: r.legal_firms.email }
            : null,
        financingConsultant: r.financing_consultants ? { name: r.financing_consultants.name } : null,
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
    agentFee: "agent_fee",
    legalCost: "legal_cost",
    renovationCost: "renovation_cost",
    otherCost: "other_cost",
    sellingCost: "selling_cost",
    targetPrice: "target_price",
    highestOffer: "highest_offer",
    expectedCompletion: "expected_completion",
    contractorName: "contractor_name",
    contractorPhone: "contractor_phone",
    legalStart: "legal_start",
    legalEnd: "legal_end",
    renovationStart: "renovation_start",
    renovationEnd: "renovation_end",
    salesStart: "sales_start",
    salesEnd: "sales_end",
    notes: "notes",
    legalFirmId: "legal_firm_id",
    financingConsultantId: "financing_consultant_id",
};

/** Converts a camelCase input body to DB columns, keeping only known fields. */
export function toInvestorPropertyRow(body: Record<string, unknown>) {
    const row: Record<string, unknown> = {};
    for (const [key, col] of Object.entries(FIELD_MAP)) {
        if (key in body) row[col] = body[key] === "" ? null : body[key];
    }
    return row;
}
