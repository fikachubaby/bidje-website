import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Coffee } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase/supabase";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
    title: "Terms of Service | Bidje",
    description: "Terms and conditions, payment terms, and refund policies for Bidje.com.",
};

export const revalidate = 3600;

async function getTermsOfService() {
    try {
        const { data } = await supabase
            .from("policies")
            .select("title, content, updated_at")
            .eq("slug", "terms-of-service")
            .eq("is_published", true)
            .maybeSingle();

        return data;
    } catch (error) {
        console.error("Failed to load Terms of Service policy:", error);
        return null;
    }
}

export default async function TermsPage() {
    const policy = await getTermsOfService();

    const formattedDate = policy?.updated_at
        ? new Date(policy.updated_at).toLocaleDateString("en-MY", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
        : new Date().toLocaleDateString("en-MY", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    return (
        <main className="min-h-screen bg-neutral-50 text-black selection:bg-[#ffd400] selection:text-black flex flex-col">
            <Navbar />
            <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
                {/* Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-sm text-neutral-500">
                    <Link href="/" className="transition-colors hover:text-brand">
                        Home
                    </Link>
                    <ChevronRight className="h-4 w-4 text-neutral-400" />
                    <span className="font-medium text-neutral-900">Terms of Service</span>
                </nav>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        {policy?.title || "Terms of Service"}
                    </h1>
                    {policy && (
                        <p className="mt-2 text-sm text-neutral-500">
                            Last updated: {formattedDate}
                        </p>
                    )}
                </div>

                {policy?.content ? (
                    /* Dynamic Markdown Content with Tailwind Typography */
                    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600 prose-strong:text-neutral-900">
                        <ReactMarkdown>{policy.content}</ReactMarkdown>
                    </article>
                ) : (
                    /* Coffee Fallback State when Policy is missing/unpublished */
                    <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-amber-50 p-4 text-amber-600">
                            <Coffee className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">
                            Taking a Quick Coffee Break!
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-neutral-500">
                            Our Legal Team is currently brewing and updating the latest Terms of Service. Please check back shortly!
                        </p>
                        <Link
                            href="/"
                            className="mt-6 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-neutral-800"
                        >
                            Back to Homepage
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}