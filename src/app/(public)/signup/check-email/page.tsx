"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MailCheck, RefreshCw, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CheckEmailPage() {
    const [resending, setResending] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);

    async function handleResend() {
        setResending(true);
        setTimeout(() => {
            setResending(false);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 4000);
        }, 1000);
    }

    return (
        <main className="min-h-screen bg-neutral-50/50 text-black">
            <Navbar />

            <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-md flex-col items-center justify-center px-5 py-12 sm:px-6">
                {/* Interactive Card Container */}
                <div className="w-full rounded-3xl border border-neutral-200/80 bg-white p-8 shadow-xl shadow-black/[0.03] text-center sm:p-10">

                    {/* Glowing Icon Container */}
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ffd400]/20 text-black shadow-inner">
                        <MailCheck className="h-8 w-8 text-neutral-900 animate-pulse" />
                    </div>

                    <h1 className="mt-6 text-2xl font-black tracking-tight text-neutral-900">
                        Check your inbox
                    </h1>

                    <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                        We&apos;ve sent a secure confirmation link to your email address. Click the link inside to activate your account and automatically submit your property offer.
                    </p>

                    {/* Notification Banner for Resend */}
                    {resendSuccess && (
                        <div className="mt-6 rounded-2xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 border border-emerald-200/60 transition-all">
                            Verification email resent successfully! Check your spam folder if it doesn&apos;t appear.
                        </div>
                    )}

                    {/* Action Hub */}
                    <div className="mt-8 space-y-3">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resending}
                            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3.5 text-sm font-bold text-neutral-800 transition-all hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${resending ? "animate-spin" : ""}`} />
                            {resending ? "Resending link..." : "Resend verification email"}
                        </button>

                        <Link
                            href="/"
                            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ffd400] py-3.5 text-sm font-black text-black transition-colors hover:bg-[#ffe24b]"
                        >
                            Back to Homepage
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <p className="mt-6 text-xs text-neutral-400">
                        Didn&apos;t receive the email? Check your promotions or spam folder.
                    </p>
                </div>
            </div>
        </main>
    );
}