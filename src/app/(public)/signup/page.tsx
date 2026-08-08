import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SignupForm } from "@/components/auth/SignupForm";
import { translate as t } from "@/lib/i18n/getTranslation";

export default function SignupPage() {
    return (
        <main className="min-h-screen bg-neutral-50 text-black selection:bg-[#ffd400] selection:text-black flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 sm:py-12">
                <div className="w-full max-w-md">

                    {/* Card Container */}
                    <div className="rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8 shadow-sm">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-neutral-900">{t("Authentication.registerTitle")}</h1>
                            <p className="text-sm font-medium text-neutral-500">
                                {t("Authentication.registerSubtitle")}
                            </p>
                        </div>

                        <div className="mt-5">
                            <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-neutral-100" />}>
                                <SignupForm />
                            </Suspense>
                        </div>
                    </div>

                    {/* Footer Link */}
                    <p className="mt-5 text-center text-sm font-medium text-neutral-600">
                        {t("Authentication.haveAccount")}{" "}
                        <Link
                            href="/login"
                            className="font-bold text-black underline decoration-[#ffd400] decoration-2 underline-offset-4 transition-colors hover:bg-[#ffd400]/20">{t("Authentication.signIn")}
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}