import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

// Files are uploaded straight from the browser to Supabase via a signed URL.
// Sending the file through this route would hit Vercel's ~4.5MB request body limit.
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "video/mp4",
];

export async function POST(request: Request) {
    const { error: authError } = await requireStaffSession();
    if (authError) return authError;

    try {
        const { name, type, size } = (await request.json()) as {
            name?: string;
            type?: string;
            size?: number;
        };

        if (!name || !type || typeof size !== "number") {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!ALLOWED_TYPES.includes(type)) {
            return NextResponse.json(
                { error: `Unsupported file type: ${type}` },
                { status: 400 }
            );
        }
        const isVideo = type === "video/mp4";
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
        if (size > maxSize) {
            return NextResponse.json(
                { error: `File too large (max ${maxSize / 1024 / 1024}MB)` },
                { status: 400 }
            );
        }

        const isPdf = type === "application/pdf";
        const bucketName = isPdf ? "property-documents" : "property-images";

        const ext = name.split(".").pop() || (isPdf ? "pdf" : "jpg");
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const filePath = `properties/${fileName}`;

        const { data: signed, error: signError } = await supabaseAdmin.storage
            .from(bucketName)
            .createSignedUploadUrl(filePath);

        if (signError) throw signError;

        const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filePath);

        return NextResponse.json({
            success: true,
            bucket: bucketName,
            path: signed.path,
            token: signed.token,
            url: publicUrlData.publicUrl,
        });
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
