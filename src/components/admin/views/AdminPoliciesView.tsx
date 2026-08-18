"use client";

import React, { useState, useEffect } from "react";
import {
    FileText,
    Save,
    Clock,
    Eye,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Sparkles,
} from "lucide-react";
import { PolicyDocument, PolicySlug } from "@/types/legal";

export function AdminPoliciesView() {
    const [policies, setPolicies] = useState<PolicyDocument[]>([]);
    const [selectedSlug, setSelectedSlug] = useState<PolicySlug>("privacy-policy");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Form state for selected policy
    const [currentId, setCurrentId] = useState("");
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    const fetchPolicies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/policies");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPolicies(data);
                loadPolicyIntoForm(data, selectedSlug);
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        }
        setIsLoading(false);
    };

    const loadPolicyIntoForm = (list: PolicyDocument[], slug: PolicySlug) => {
        const doc = list.find((p) => p.slug === slug);
        if (doc) {
            setCurrentId(doc.id);
            setTitle(doc.title);
            setContent(doc.content);
            setIsPublished(doc.is_published);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleTabChange = (slug: PolicySlug) => {
        setSelectedSlug(slug);
        loadPolicyIntoForm(policies, slug);
        setSaveSuccess(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const res = await fetch("/api/admin/policies", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: currentId,
                    title,
                    content,
                    is_published: isPublished,
                }),
            });

            if (res.ok) {
                const updatedDoc = await res.json();
                setPolicies((prev) =>
                    prev.map((p) => (p.id === currentId ? updatedDoc : p))
                );
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Failed to update policy:", err);
        }

        setIsSaving(false);
    };

    const activePolicy = policies.find((p) => p.slug === selectedSlug);

    return (
        <div className="space-y-6 p-6 lg:p-8 bg-neutral-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        Legal & Policy Management
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Update Privacy Policies, Terms of Service, and compliance documents without changing code.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-neutral-200 pb-4 gap-2">
                {[
                    { slug: "privacy-policy", label: "Privacy Policy" },
                    { slug: "terms-of-service", label: "Terms of Service" },
                    { slug: "payment-policy", label: "Payment Policy" },
                    { slug: "refund-cancel-policy", label: "Refund & Cancellation Policy" },
                ].map((tab) => (
                    <button
                        key={tab.slug}
                        onClick={() => handleTabChange(tab.slug as PolicySlug)}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${selectedSlug === tab.slug
                                ? "bg-neutral-900 text-white shadow-sm"
                                : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12 text-neutral-500 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-medium">Loading content from Supabase...</span>
                </div>
            ) : (
                <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-4">
                        {saveSuccess && (
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2 text-xs font-bold">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                Policy content saved and published successfully!
                            </div>
                        )}

                        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                            <div>
                                <label className="block text-neutral-700 font-bold text-xs mb-1">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-bold text-neutral-900 outline-none focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-bold text-xs mb-1">
                                    Policy Content (Supports HTML / Markdown Text)
                                </label>
                                <textarea
                                    rows={20}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-3 text-xs font-mono text-neutral-800 outline-none focus:border-neutral-900 leading-relaxed"
                                    placeholder="Enter policy content here..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / Metadata Controls */}
                    <div className="space-y-4">
                        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                                <Sparkles className="h-4 w-4 text-amber-500" /> Settings & Metadata
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider block">
                                    Status
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setIsPublished(!isPublished)}
                                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${isPublished
                                            ? "bg-emerald-100 text-emerald-800"
                                            : "bg-neutral-100 text-neutral-500"
                                        }`}
                                >
                                    <span className="flex items-center gap-1.5">
                                        {isPublished ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                        {isPublished ? "Published" : "Draft Mode"}
                                    </span>
                                    <span className="text-[10px] underline">Toggle</span>
                                </button>
                            </div>

                            {activePolicy?.updated_at && (
                                <div className="pt-2">
                                    <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                                        Last Updated
                                    </span>
                                    <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
                                        <Clock className="h-3.5 w-3.5 text-neutral-400" />
                                        {new Date(activePolicy.updated_at).toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}