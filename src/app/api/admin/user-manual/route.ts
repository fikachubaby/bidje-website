import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

const BUCKET = "property-documents";
const FOLDER = "user-manual";
const FILE_NAME = "user-manual.pdf";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/** The current user manual PDF, or null if none has been uploaded yet. */
export async function GET() {
    const { error: authError } = await requireStaffSession();
    if (authError) return authError;

    const { data, error } = await supabaseAdmin.storage.from(BUCKET).list(FOLDER, { search: FILE_NAME });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const file = (data ?? []).find((f) => f.name === FILE_NAME);
    if (!file) return NextResponse.json({ manual: null });

    const { data: publicUrlData } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${FILE_NAME}`);
    const updatedAt = file.updated_at ?? file.created_at ?? null;

    return NextResponse.json({
        manual: {
            // Version query so a replaced PDF isn't served from cache
            url: `${publicUrlData.publicUrl}?v=${encodeURIComponent(updatedAt ?? "")}`,
            updatedAt,
            size: (file.metadata as { size?: number } | null)?.size ?? null,
        },
    });
}

/** Returns a signed URL so an admin can upload (or replace) the manual straight to storage. */
export async function POST(request: Request) {
    const { error: authError, role, user } = await requireStaffSession();
    if (authError) return authError;
    if (role !== "admin") {
        return NextResponse.json({ error: "Only admins can replace the user manual" }, { status: 403 });
    }

    const { type, size } = (await request.json()) as { type?: string; size?: number };
    if (type !== "application/pdf") {
        return NextResponse.json({ error: "The user manual must be a PDF file" }, { status: 400 });
    }
    if (typeof size !== "number" || size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "File too large (max 50MB)" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUploadUrl(`${FOLDER}/${FILE_NAME}`, { upsert: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabaseAdmin.from("audit_logs").insert({
        actor_id: user?.id ?? null,
        action: "Uploaded a new user manual",
        entity: "user_manual",
        entity_id: null,
    });

    return NextResponse.json({ bucket: BUCKET, path: data.path, token: data.token });
}
