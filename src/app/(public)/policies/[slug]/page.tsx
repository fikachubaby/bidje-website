import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRight, Coffee } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/lib/supabase/supabase";
import { Navbar } from "@/components/layout/Navbar";

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    if (!slug) return { title: "Legal Policy | Bidje.com" };

    const { data } = await supabase
        .from("policies")
        .select("title, description")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();

    return {
        title: data?.title || "Legal Policy | Bidje.com",
        description: data?.description || "Bidje.com legal policy and compliance information.",
    };
}

export const revalidate = 3600;

async function getPolicy(slug: string) {
    if (!slug) return null;

    // Map short URL names to your actual database slugs
    const slugMap: Record<string, string> = {
        "privacy": "privacy-policy",
        "terms": "terms-of-service",
        "payment": "payment-policy",
        "refund": "refund-cancel-policy"
    };

    const actualSlug = slugMap[slug] || slug;

    try {
        const { data } = await supabase
            .from("policies")
            .select("title, content, updated_at")
            .eq("slug", actualSlug)
            .eq("is_published", true)
            .maybeSingle();

        return data;
    } catch (error) {
        console.error("Failed to load policy:", error);
        return null;
    }
}

function formatSlugTitle(slug?: string): string {
    if (!slug || typeof slug !== "string") return "Legal Policy";
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

export default async function DynamicPolicyPage({ params }: PageProps) {
    const resolvedParams = await params;
    const slug = resolvedParams?.slug;
    const policy = await getPolicy(slug);

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

    const breadcrumbTitle = policy?.title || formatSlugTitle(slug);

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
                    <span className="font-medium text-neutral-900">{breadcrumbTitle}</span>
                </nav>

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                        {policy?.title || breadcrumbTitle}
                    </h1>
                    {policy && (
                        <p className="mt-2 text-sm text-neutral-500">
                            Last updated: {formattedDate}
                        </p>
                    )}
                </div>

                {policy?.content ? (
                    <article className="prose prose-neutral max-w-none prose-headings:font-semibold prose-headings:text-neutral-900 prose-p:text-neutral-600 prose-p:leading-relaxed prose-li:text-neutral-600 prose-strong:text-neutral-900">
                        <ReactMarkdown>{policy.content}</ReactMarkdown>
                    </article>
                ) : (
                    <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-neutral-200 bg-white p-10 text-center shadow-sm">
                        <div className="mb-4 rounded-full bg-amber-50 p-4 text-amber-600">
                            <Coffee className="h-8 w-8" />
                        </div>
                        <h2 className="text-xl font-bold text-neutral-900">
                            Taking a Quick Coffee Break!
                        </h2>
                        <p className="mt-2 max-w-md text-sm text-neutral-500">
                            Our Legal Team is currently brewing and updating this policy content. Please check back shortly!
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