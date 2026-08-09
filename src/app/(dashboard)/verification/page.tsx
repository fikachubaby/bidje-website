"use client";

import { useState, type FormEvent } from "react";
import { ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Loader2, ChevronRight, Home } from "lucide-react";
import Link from "next/link";

export default function VerificationPage() {
    const [icFile, setIcFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    async function handleVerificationSubmit(e: FormEvent) {
        e.preventDefault();
        setMessage(null);

        if (!icFile) {
            setMessage({ type: "error", text: "Please select an identity card file to upload." });
            return;
        }

        setSubmitting(true);
        setTimeout(() => {
            setMessage({ type: "success", text: "Identity documents submitted successfully for verification!" });
            setIcFile(null);
            setSubmitting(false);
        }, 1000);
    }

    return (
        <div className="mx-auto max-w-3xl space-y-8 pb-12">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-sm text-neutral-500">
                <Link href="/dashboard" className="flex items-center gap-1.5 transition-colors hover:text-black">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                </Link>
                <ChevronRight className="h-4 w-4 text-neutral-400" />
                <span className="font-medium text-black">Account Verification</span>
            </nav>

            <div>
                <h1 className="text-3xl font-bold tracking-tight text-black">Subscriber Identity Verification</h1>
                <p className="mt-1 text-sm text-neutral-500">Verify your account status to unlock direct owner property bidding privileges.</p>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-black">KYC Document Upload</h2>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                        Verified Status: Active
                    </span>
                </div>

                <form onSubmit={handleVerificationSubmit} className="mt-6 space-y-6">
                    {message && (
                        <div className={`flex items-center gap-2 rounded-2xl p-4 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                            {message.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Upload National Registration ID / Passport (IC)</label>
                        <input
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => e.target.files && setIcFile(e.target.files[0])}
                            className="mt-1.5 w-full text-xs text-neutral-500 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-black hover:file:bg-neutral-200 cursor-pointer"
                        />
                        {icFile && (
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                                <FileText className="h-4 w-4" /> Ready to upload: {icFile.name}
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                    >
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Upload className="h-4 w-4" /> Submit Verification Document
                    </button>
                </form>
            </div>
        </div>
    );
}