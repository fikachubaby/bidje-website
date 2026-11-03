import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export type PartnerKind = "legal" | "financing";

export const PARTNER_TABLE: Record<PartnerKind, string> = {
    legal: "legal_firms",
    financing: "financing_consultants",
};

const PARTNER_COLUMNS: Record<PartnerKind, string> = {
    legal: "id, name, contact_person, email, phone, address, added_by",
    financing: "id, name, added_by",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapPartner(r: any) {
    return {
        id: r.id as string,
        name: r.name as string,
        contactPerson: r.contact_person ?? null,
        email: r.email ?? null,
        phone: r.phone ?? null,
        address: r.address ?? null,
        // true when the investor keyed it in themselves via "Other"
        own: Boolean(r.added_by),
    };
}

/** Bidje's active partners plus any the investor added themselves. */
export async function listInvestorPartners(kind: PartnerKind, investorId: string) {
    const { data, error } = await supabaseAdmin
        .from(PARTNER_TABLE[kind])
        .select(PARTNER_COLUMNS[kind])
        .or(`and(added_by.is.null,is_active.eq.true),added_by.eq.${investorId}`)
        .order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapPartner);
}

/** An investor may only link a Bidje partner or a firm they added themselves. */
export async function canUsePartner(kind: PartnerKind, id: string, investorId: string): Promise<boolean> {
    const { data } = await supabaseAdmin.from(PARTNER_TABLE[kind]).select("added_by").eq("id", id).maybeSingle();
    if (!data) return false;
    return data.added_by === null || data.added_by === investorId;
}
