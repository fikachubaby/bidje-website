"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Download, ExternalLink, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { supabase } from "@/lib/supabase/supabase";
import { formatFileSize } from "@/lib/telegram/telegram-import";

const LINK_BUTTON =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-bold text-neutral-900 transition-colors hover:bg-neutral-50";

interface UserManual {
    url: string;
    updatedAt: string | null;
    size: number | null;
}

export function UserManualView({ canUpload }: { canUpload: boolean }) {
    const [manual, setManual] = useState<UserManual | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadManual = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/user-manual");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load the user manual");
            setManual(data.manual);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to load the user manual");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadManual();
    }, [loadManual]);

    const handleUpload = async (file: File | null) => {
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Please choose a PDF file");
            return;
        }
        setUploading(true);
        try {
            const res = await fetch("/api/admin/user-manual", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: file.type, size: file.size }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to upload the user manual");

            const { error } = await supabase.storage
                .from(data.bucket)
                .uploadToSignedUrl(data.path, data.token, file, { contentType: file.type, upsert: true });
            if (error) throw new Error(error.message);

            toast.success("User manual updated");
            await loadManual();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to upload the user manual");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-neutral-100 p-2.5 text-neutral-700">
                        <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-neutral-900">Bidje Admin User Manual</p>
                        <p className="text-xs text-neutral-500">
                            {manual
                                ? `Last updated ${manual.updatedAt ? new Date(manual.updatedAt).toLocaleDateString() : "—"}${
                                      manual.size ? ` · ${formatFileSize(manual.size)}` : ""
                                  }`
                                : "No manual uploaded yet"}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {manual && (
                        <>
                            <a href={manual.url} target="_blank" rel="noopener noreferrer" className={LINK_BUTTON}>
                                <ExternalLink className="h-4 w-4" /> Open in new tab
                            </a>
                            <a href={manual.url} download="bidje-user-manual.pdf" className={LINK_BUTTON}>
                                <Download className="h-4 w-4" /> Download
                            </a>
                        </>
                    )}
                    {canUpload && (
                        <>
                            <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {manual ? "Replace PDF" : "Upload PDF"}
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                onChange={(e) => {
                                    handleUpload(e.target.files?.[0] ?? null);
                                    e.target.value = "";
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {loading ? (
                <p className="py-12 text-center text-sm text-neutral-500">Loading user manual...</p>
            ) : manual ? (
                <iframe
                    src={manual.url}
                    title="Bidje user manual"
                    className="h-[calc(100vh-14rem)] min-h-125 w-full rounded-2xl border border-neutral-200 bg-white"
                />
            ) : (
                <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-white px-6 py-16 text-center">
                    <BookOpen className="mx-auto h-10 w-10 text-neutral-300" />
                    <p className="mt-3 text-sm font-bold text-neutral-700">The user manual hasn&apos;t been uploaded yet.</p>
                    <p className="mt-1 text-xs text-neutral-500">
                        {canUpload ? "Upload a PDF and every staff member will be able to read it here." : "Ask an admin to upload it."}
                    </p>
                </div>
            )}
        </div>
    );
}
