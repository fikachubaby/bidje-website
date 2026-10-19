import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import type { FinancingScreening } from "@/constants/financing-screening";

const SELECT = "*, financing_screening_documents (id, doc_key, file_name, size_bytes, created_at)";

export function mapScreening(row: Record<string, unknown>): FinancingScreening {
    const docs = (row.financing_screening_documents as Record<string, unknown>[] | null) ?? [];
    return {
        id: row.id as string,
        applicantType: row.applicant_type as FinancingScreening["applicantType"],
        companyKind: (row.company_kind as FinancingScreening["companyKind"]) ?? null,
        status: row.status as FinancingScreening["status"],
        feeAmount: Number(row.fee_amount),
        feePaidAt: (row.fee_paid_at as string) ?? null,
        consentAt: (row.consent_at as string) ?? null,
        staffRemark: (row.staff_remark as string) ?? null,
        validUntil: (row.valid_until as string) ?? null,
        createdAt: row.created_at as string,
        documents: docs
            .map((d) => ({
                id: d.id as string,
                docKey: d.doc_key as string,
                fileName: d.file_name as string,
                sizeBytes: d.size_bytes === null ? null : Number(d.size_bytes),
                createdAt: d.created_at as string,
            }))
            .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    };
}

/**
 * The user's screening still in play: anything in progress, or a result that hasn't expired.
 * Expired eligible results and not-eligible results older than the latest are ignored so the
 * user can start over.
 */
export async function getActiveScreening(userId: string) {
    const { data } = await supabaseAdmin
        .from("financing_screenings")
        .select(SELECT)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (!data) return null;
    const screening = mapScreening(data);
    if (screening.status === "eligible" && screening.validUntil && new Date(screening.validUntil) < new Date()) {
        return null;
    }
    return screening;
}

export async function getOwnedScreening(userId: string, id: string) {
    const { data } = await supabaseAdmin
        .from("financing_screenings")
        .select(SELECT)
        .eq("id", id)
        .eq("user_id", userId)
        .maybeSingle();
    return data ? mapScreening(data) : null;
}

export async function getScreeningById(id: string) {
    const { data } = await supabaseAdmin.from("financing_screenings").select(SELECT).eq("id", id).maybeSingle();
    return data ? mapScreening(data) : null;
}
