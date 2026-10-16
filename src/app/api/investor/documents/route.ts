import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { ingestDocument, isSupportedDocument, MAX_DOCUMENT_BYTES } from "@/lib/investor-server/documents";

export const maxDuration = 300;

async function ownProperty(userId: string, propertyId: string) {
    const { data } = await supabaseAdmin
        .from("investor_properties")
        .select("id, address")
        .eq("id", propertyId)
        .eq("investor_id", userId)
        .maybeSingle();
    return data;
}

export async function GET(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const propertyId = new URL(req.url).searchParams.get("propertyId") ?? "";
    if (!(await ownProperty(session.user.id, propertyId))) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
        .from("investor_documents")
        .select("id, file_name, status, ai_summary, created_at")
        .eq("investor_property_id", propertyId)
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ documents: data ?? [] });
}

export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const form = await req.formData();
    const file = form.get("file");
    const propertyId = String(form.get("investorPropertyId") ?? "");

    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!isSupportedDocument(file.type)) {
        return NextResponse.json({ error: "Upload a PDF, JPG, PNG or WEBP file" }, { status: 400 });
    }
    if (file.size > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

    const property = await ownProperty(session.user.id, propertyId);
    if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

    try {
        const id = await ingestDocument({
            investorPropertyId: property.id,
            propertyAddress: property.address,
            uploadedBy: session.user.id,
            file,
        });
        return NextResponse.json({ id }, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
    }
}
