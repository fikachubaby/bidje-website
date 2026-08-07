import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${file.type}` },
                { status: 400 }
            );
        }
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
        }

        const ext = file.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `properties/${fileName}`;

        const arrayBuffer = await file.arrayBuffer();

        const { error: uploadError } = await supabaseAdmin.storage
            .from("property-images")
            .upload(filePath, arrayBuffer, {
                contentType: file.type,
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseAdmin.storage
            .from("property-images")
            .getPublicUrl(filePath);

        return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}