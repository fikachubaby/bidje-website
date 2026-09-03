import { supabase } from "@/lib/supabase/supabase";

export interface PartnerOption {
    id: string;
    name: string;
}

export interface PartnerOptionsResult {
    legalFirms: PartnerOption[];
    financingConsultants: PartnerOption[];
}

export async function fetchOfferPartnerOptions(): Promise<PartnerOptionsResult> {
    let legalFirms: PartnerOption[] = [];
    let financingConsultants: PartnerOption[] = [];

    try {
        const [legalRes, consultantRes] = await Promise.all([
            supabase
                .from("legal_firms")
                .select("id, name")
                .eq("is_active", true)
                .order("name", { ascending: true }),
            supabase
                .from("financing_consultants")
                .select("id, name")
                .eq("is_active", true)
                .order("name", { ascending: true }),
        ]);

        if (legalRes.data && legalRes.data.length > 0) {
            legalFirms = legalRes.data;
        } else {
            const { data: fallbackLegal } = await supabase
                .from("legal_firms")
                .select("id, name")
                .order("name", { ascending: true });
            if (fallbackLegal) legalFirms = fallbackLegal;
        }

        if (consultantRes.data && consultantRes.data.length > 0) {
            financingConsultants = consultantRes.data;
        } else {
            const { data: fallbackConsultants, error: fallbackError } = await supabase
                .from("financing_consultants")
                .select("id, name")
                .order("name", { ascending: true });

            if (fallbackError) {
                console.error("Error fetching fallback consultants:", fallbackError.message);
            } else if (fallbackConsultants) {
                financingConsultants = fallbackConsultants;
            }
        }
    } catch (err) {
        console.error("Unexpected error fetching partner options:", err);
    }

    return { legalFirms, financingConsultants };
}