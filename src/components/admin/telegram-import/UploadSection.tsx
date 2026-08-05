"use client";

import { AlertTriangle, FileArchive, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { formatFileSize } from "@/lib/telegram/telegram-import";
import { cn } from "@/lib/utils";
import type { TelegramParseProgress } from "@/types/telegram-import";

interface UploadSectionProps {
    file: File | null;
    parsing: boolean;
    progress: TelegramParseProgress | null;
    error: string | null;
    onAcceptFile: (file: File | null) => void;
    onClearFile: () => void;
    onParse: () => void;
}

export function UploadSection({
    file,
    parsing,
    progress,
    error,
    onAcceptFile,
    onClearFile,
    onParse,
}: UploadSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);

    const progressPercent =
        progress && progress.total > 0
            ? Math.min(100, Math.round((progress.current / progress.total) * 100))
            : parsing
                ? 5
                : 0;

    return (
        <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="text-xl font-black text-neutral-900">Upload Telegram Export</h2>
            <p className="mt-2 text-sm text-neutral-500">
                Upload the complete Telegram export ZIP containing result.json and the photos folder.
            </p>

            <div
                className={cn(
                    "mt-6 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
                    dragOver
                        ? "border-brand bg-brand/10"
                        : "border-neutral-300 bg-neutral-50 hover:border-neutral-400"
                )}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const dropped = e.dataTransfer.files?.[0] ?? null;
                    onAcceptFile(dropped);
                }}
            >
                <FileArchive className="mx-auto h-10 w-10 text-neutral-400" />
                <p className="mt-3 text-sm font-bold text-neutral-700">
                    Drag and drop a .zip file here
                </p>
                <p className="mt-1 text-xs text-neutral-500">or choose a file from your computer</p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <AdminButton
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={parsing}
                    >
                        <Upload className="h-4 w-4" />
                        Choose ZIP
                    </AdminButton>
                    {file ? (
                        <AdminButton
                            type="button"
                            variant="secondary"
                            onClick={onClearFile}
                            disabled={parsing}
                        >
                            <X className="h-4 w-4" />
                            Clear file
                        </AdminButton>
                    ) : null}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip,application/zip"
                    className="hidden"
                    onChange={(e) => onAcceptFile(e.target.files?.[0] ?? null)}
                />
            </div>

            {file ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div>
                        <p className="text-sm font-bold text-neutral-900">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
                    </div>
                    <AdminButton type="button" onClick={onParse} disabled={parsing}>
                        {parsing ? "Parsing…" : "Parse Export"}
                    </AdminButton>
                </div>
            ) : null}

            {parsing && progress ? (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <p className="font-medium text-neutral-700">{progress.message}</p>
                        <p className="font-bold text-neutral-500">{progressPercent}%</p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                        <div
                            className="h-full rounded-full bg-brand transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            ) : null}

            {error ? (
                <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                </div>
            ) : null}
        </article>
    );
}