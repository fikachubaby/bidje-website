import { NextResponse } from "next/server";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";
import {
    deleteSharedDocument,
    isSupportedDocument,
    listSharedDocuments,
    MAX_DOCUMENT_BYTES,
    storeSharedDocument,
} from "@/lib/investor-server/documents";

type Params = { params: Promise<{ id: string }> };

const fail = (err: unknown, fallback: string) =>
    NextResponse.json({ error: err instanceof Error ? err.message : fallback }, { status: 500 });

/** Documents Bidje has uploaded for the investor of this property. */
export async function GET(_req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;
    try {
        return NextResponse.json({ documents: await listSharedDocuments(id) });
    } catch (err) {
        return fail(err, "Failed to load documents");
    }
}

export async function POST(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const file = (await req.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    if (!isSupportedDocument(file.type)) {
        return NextResponse.json({ error: "Upload a PDF, JPG, PNG or WEBP file" }, { status: 400 });
    }
    if (file.size > MAX_DOCUMENT_BYTES) return NextResponse.json({ error: "File must be under 10 MB" }, { status: 400 });

    try {
        await storeSharedDocument({ investorPropertyId: id, uploadedBy: session.user.id, file });
        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        return fail(err, "Upload failed");
    }
}

export async function DELETE(req: Request, { params }: Params) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { id } = await params;

    const docId = new URL(req.url).searchParams.get("docId");
    if (!docId) return NextResponse.json({ error: "Missing document" }, { status: 400 });
    try {
        await deleteSharedDocument(id, docId);
        return NextResponse.json({ success: true });
    } catch (err) {
        return fail(err, "Failed to delete");
    }
}
