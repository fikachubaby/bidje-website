import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";
import { getOwnedScreening } from "@/lib/financing/screening-server";
import {
    MAX_SCREENING_FILE_BYTES,
    SCREENING_DOCUMENT_BUCKET,
    SCREENING_FILE_TYPES,
    requiredDocuments,
} from "@/constants/financing-screening";

const EDITABLE = ["awaiting_documents", "payment_pending", "additional_documents_required"];

/** Uploads one file for a document slot into the private financing bucket. */
export async function POST(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const form = await req.formData();
    const screeningId = String(form.get("screeningId") ?? "");
    const docKey = String(form.get("docKey") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file received" }, { status: 400 });
    if (file.size > MAX_SCREENING_FILE_BYTES) return NextResponse.json({ error: "Files must be 10MB or smaller" }, { status: 400 });
    if (!SCREENING_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: "Upload a PDF or an image (JPG, PNG, WEBP, HEIC)" }, { status: 400 });
    }

    const screening = await getOwnedScreening(session.user.id, screeningId);
    if (!screening) return NextResponse.json({ error: "Screening not found" }, { status: 404 });
    if (!EDITABLE.includes(screening.status)) {
        return NextResponse.json({ error: "Documents are locked while your screening is in review." }, { status: 409 });
    }
    if (!requiredDocuments(screening.applicantType, screening.companyKind).some((d) => d.key === docKey)) {
        return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
    }

    const path = `${session.user.id}/${screening.id}/${docKey}/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error: upErr } = await supabaseAdmin.storage
        .from(SCREENING_DOCUMENT_BUCKET)
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    const { data, error } = await supabaseAdmin
        .from("financing_screening_documents")
        .insert({
            screening_id: screening.id,
            doc_key: docKey,
            file_path: path,
            file_name: file.name,
            mime_type: file.type,
            size_bytes: file.size,
        })
        .select("id, doc_key, file_name, size_bytes, created_at")
        .single();
    if (error) {
        await supabaseAdmin.storage.from(SCREENING_DOCUMENT_BUCKET).remove([path]);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        document: {
            id: data.id,
            docKey: data.doc_key,
            fileName: data.file_name,
            sizeBytes: data.size_bytes,
            createdAt: data.created_at,
        },
    });
}

/** Removes one of the user's uploads while the screening is still editable. */
export async function DELETE(req: Request) {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { data: doc } = await supabaseAdmin
        .from("financing_screening_documents")
        .select("id, file_path, financing_screenings!inner (user_id, status)")
        .eq("id", id)
        .maybeSingle();
    const parent = doc?.financing_screenings as unknown as { user_id: string; status: string } | undefined;
    if (!doc || parent?.user_id !== session.user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!EDITABLE.includes(parent.status)) {
        return NextResponse.json({ error: "Documents are locked while your screening is in review." }, { status: 409 });
    }

    await supabaseAdmin.storage.from(SCREENING_DOCUMENT_BUCKET).remove([doc.file_path]);
    await supabaseAdmin.from("financing_screening_documents").delete().eq("id", id);
    return NextResponse.json({ success: true });
}
