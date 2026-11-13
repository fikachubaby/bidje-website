"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DOCUMENT_REMARKS = ["IC", "Owner", "SPA", "Title / Geran", "Loan agreement", "Receipt", "Other"];
const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp";
const fieldClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black";

interface UploadWithRemarkProps {
    label: string;
    hint?: string;
    busy: boolean;
    onUpload: (file: File, remark: string) => Promise<void> | void;
}

/** Upload button with a remark next to it (IC / Owner / SPA / etc). The remark clears after each upload. */
export function UploadWithRemark({ label, hint, busy, onUpload }: UploadWithRemarkProps) {
    const [remark, setRemark] = useState("");

    return (
        <div className={cn("grid gap-2 sm:grid-cols-[1fr_220px]", busy && "pointer-events-none opacity-60")}>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-bold hover:border-neutral-500">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {busy ? "Uploading..." : label}
                {hint && <span className="hidden font-normal text-neutral-500 sm:inline">{hint}</span>}
                <input
                    type="file"
                    accept={ACCEPT}
                    className="hidden"
                    onChange={async (e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (!f) return;
                        await onUpload(f, remark.trim());
                        setRemark("");
                    }}
                />
            </label>
            <input
                className={fieldClass}
                list="document-remarks"
                placeholder="Remark (IC / Owner / SPA / etc)"
                maxLength={120}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
            />
            <datalist id="document-remarks">
                {DOCUMENT_REMARKS.map((r) => (
                    <option key={r} value={r} />
                ))}
            </datalist>
        </div>
    );
}

export { fieldClass as uploadFieldClass, ACCEPT as UPLOAD_ACCEPT };

export function RemarkBadge({ remark }: { remark: string }) {
    return <span className="shrink-0 rounded-full bg-brand-muted px-2 py-0.5 text-[11px] font-black text-neutral-800">{remark}</span>;
}
