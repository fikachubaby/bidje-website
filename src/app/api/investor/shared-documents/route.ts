import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { listSharedDocuments } from "@/lib/investor-server/documents";

/** Documents Bidje has shared on one of the signed-in investor's own properties. */
export async function GET(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const propertyId = new URL(req.url).searchParams.get("propertyId") ?? "";
    const { data: own } = await supabaseAdmin
        .from("investor_properties")
        .select("id")
        .eq("id", propertyId)
        .eq("investor_id", session.user.id)
        .maybeSingle();
    if (!own) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        return NextResponse.json({ documents: await listSharedDocuments(own.id) });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to load documents" }, { status: 500 });
    }
}
