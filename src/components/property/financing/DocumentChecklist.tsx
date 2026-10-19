import { useRef } from "react";
import { CheckCircle2, FileText, Loader2, Lock, Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    SCREENING_DOCUMENT_RETENTION_DAYS,
    SCREENING_FILE_TYPES,
    requiredDocuments,
    type FinancingScreening,
    type RequiredDocument,
} from "@/constants/financing-screening";

interface DocumentChecklistProps {
    screening: FinancingScreening;
    uploading: string | null;
    onUpload: (docKey: string, files: FileList) => void;
    onRemove: (docId: string) => void;
}

export function DocumentChecklist({ screening, uploading, onUpload, onRemove }: DocumentChecklistProps) {
    const docs = requiredDocuments(screening.applicantType, screening.companyKind);
    const required = docs.filter((d) => !d.optional);
    const ready = required.filter((d) => screening.documents.some((f) => f.docKey === d.key)).length;
    const pct = required.length ? Math.round((ready / required.length) * 100) : 100;

    return (
        <div className="space-y-4">
            <div className="rounded-2xl bg-neutral-50 p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-black">
                        {ready === required.length ? "All set! 🎉" : `${ready} of ${required.length} ready`}
                    </span>
                    <span className="font-semibold text-neutral-500">{pct}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-200">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-dark transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            <ul className="space-y-3">
                {docs.map((doc) => (
                    <DocumentRow
                        key={doc.key}
                        doc={doc}
                        files={screening.documents.filter((f) => f.docKey === doc.key)}
                        uploading={uploading === doc.key}
                        disabled={Boolean(uploading)}
                        onUpload={(files) => onUpload(doc.key, files)}
                        onRemove={onRemove}
                    />
                ))}
            </ul>

            <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-800">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Your documents are kept in private, access-controlled storage, viewable only by authorised Bidje screening
                staff, and deleted {SCREENING_DOCUMENT_RETENTION_DAYS} days after a decision. Please don&apos;t upload your
                CCRIS report. With your consent, we run the check ourselves.
            </p>
        </div>
    );
}

function DocumentRow({
    doc,
    files,
    uploading,
    disabled,
    onUpload,
    onRemove,
}: {
    doc: RequiredDocument;
    files: FinancingScreening["documents"];
    uploading: boolean;
    disabled: boolean;
    onUpload: (files: FileList) => void;
    onRemove: (id: string) => void;
}) {
    const input = useRef<HTMLInputElement>(null);
    const done = files.length > 0;

    return (
        <li
            className={cn(
                "rounded-2xl border-2 p-3.5 transition-colors",
                done ? "border-emerald-200 bg-emerald-50/40" : "border-dashed border-neutral-200 bg-white"
            )}
        >
            <div className="flex items-start gap-3">
                <span
                    className={cn(
                        "grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                        done ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-400"
                    )}
                >
                    {done ? <CheckCircle2 className="h-5 w-5 animate-pop" /> : <FileText className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-black">
                        {doc.label}
                        {doc.optional && <span className="ml-1 text-xs font-medium text-neutral-400">(optional)</span>}
                    </p>
                    {doc.hint && <p className="text-xs text-neutral-500">{doc.hint}</p>}
                </div>
                <button
                    type="button"
                    onClick={() => input.current?.click()}
                    disabled={disabled}
                    className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors disabled:opacity-50",
                        done ? "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50" : "bg-black text-white hover:bg-neutral-800"
                    )}
                >
                    {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : done ? (
                        <Plus className="h-3.5 w-3.5" />
                    ) : (
                        <Upload className="h-3.5 w-3.5" />
                    )}
                    {done ? "Add" : "Upload"}
                </button>
                <input
                    ref={input}
                    type="file"
                    multiple
                    accept={SCREENING_FILE_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files?.length) onUpload(e.target.files);
                        e.target.value = "";
                    }}
                />
            </div>

            {files.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-12">
                    {files.map((f) => (
                        <li key={f.id} className="flex animate-step-in items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs ring-1 ring-neutral-100">
                            <span className="min-w-0 flex-1 truncate text-neutral-700">{f.fileName}</span>
                            {f.sizeBytes !== null && (
                                <span className="shrink-0 text-neutral-400">{(f.sizeBytes / 1024 / 1024).toFixed(1)}MB</span>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemove(f.id)}
                                className="shrink-0 rounded p-0.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                                aria-label={`Remove ${f.fileName}`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </li>
    );
}
