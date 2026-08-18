"use client";

import React, { useState, useEffect } from "react";
import {
    Megaphone,
    Plus,
    Search,
    Eye,
    MousePointerClick,
    Calendar,
    Sparkles,
    ExternalLink,
    Trash2,
    CheckCircle2,
    XCircle,
    Tag,
    X,
    Building2,
    Loader2,
    FileText,
    Save,
    Clock,
} from "lucide-react";
import { Advertisement, AdPlacement, AdType } from "@/types/ad";
import { PolicyDocument, PolicySlug } from "@/types/legal";

export function AdminAdsView() {
    // Top-Level Module Tab
    const [mainTab, setMainTab] = useState<"ADS" | "POLICIES">("ADS");

    // ==========================================
    // ADVERTISEMENT MANAGEMENT STATES & LOGIC
    // ==========================================
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoadingAds, setIsLoadingAds] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"ALL" | AdType>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<AdType>("BANNER");
    const [newPlacement, setNewPlacement] = useState<AdPlacement>("HOMEPAGE_HERO");
    const [newTargetUrl, setNewTargetUrl] = useState("");
    const [newCta, setNewCta] = useState("Learn More");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAds = async () => {
        setIsLoadingAds(true);
        try {
            const res = await fetch("/api/admin/advertisements");
            const data = await res.json();
            if (Array.isArray(data)) setAds(data);
        } catch (err) {
            console.error("Fetch ads failed:", err);
        }
        setIsLoadingAds(false);
    };

    // ==========================================
    // POLICY / CMS STATES & LOGIC
    // ==========================================
    const [policies, setPolicies] = useState<PolicyDocument[]>([]);
    const [selectedSlug, setSelectedSlug] = useState<PolicySlug>("privacy-policy");
    const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);
    const [isSavingPolicy, setIsSavingPolicy] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const [policyId, setPolicyId] = useState("");
    const [policyTitle, setPolicyTitle] = useState("");
    const [policyContent, setPolicyContent] = useState("");
    const [policyPublished, setPolicyPublished] = useState(true);

    const fetchPolicies = async () => {
        setIsLoadingPolicies(true);
        try {
            const res = await fetch("/api/admin/policies");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPolicies(data);
                loadPolicyIntoForm(data, selectedSlug);
            }
        } catch (err) {
            console.error("Fetch policies failed:", err);
        }
        setIsLoadingPolicies(false);
    };

    const loadPolicyIntoForm = (list: PolicyDocument[], slug: PolicySlug) => {
        const doc = list.find((p) => p.slug === slug);
        if (doc) {
            setPolicyId(doc.id);
            setPolicyTitle(doc.title);
            setPolicyContent(doc.content);
            setPolicyPublished(doc.is_published);
        } else {
            setPolicyId("");
            setPolicyTitle("");
            setPolicyContent("");
            setPolicyPublished(true);
        }
    };

    useEffect(() => {
        fetchAds();
        fetchPolicies();
    }, []);

    const handlePolicyTabChange = (slug: PolicySlug) => {
        setSelectedSlug(slug);
        loadPolicyIntoForm(policies, slug);
        setSaveSuccess(false);
    };

    const handleSavePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPolicy(true);
        setSaveSuccess(false);

        try {
            const res = await fetch("/api/admin/policies", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: policyId,
                    slug: selectedSlug,
                    title: policyTitle,
                    content: policyContent,
                    is_published: policyPublished,
                }),
            });

            if (res.ok) {
                const updatedDoc = await res.json();
                setPolicies((prev) =>
                    prev.some((p) => p.slug === selectedSlug)
                        ? prev.map((p) => (p.slug === selectedSlug ? updatedDoc : p))
                        : [...prev, updatedDoc]
                );
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Failed to update policy:", err);
        }

        setIsSavingPolicy(false);
    };

    // Filters for Ads
    const filteredAds = ads.filter((ad) => {
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = activeTab === "ALL" || ad.type === activeTab;
        return matchesSearch && matchesType;
    });

    const activePolicy = policies.find((p) => p.slug === selectedSlug);

    return (
        <div className="space-y-6 p-6 lg:p-8 bg-neutral-50 min-h-screen">
            {/* Main Header & Section Switcher */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        Content & Campaign Control Center
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage promotions, advertisement banners, and public legal policies.
                    </p>
                </div>

                {/* Section Selector */}
                <div className="flex items-center gap-2 bg-neutral-200/60 p-1 rounded-xl">
                    <button
                        onClick={() => setMainTab("ADS")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${mainTab === "ADS"
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        <Megaphone className="h-4 w-4" /> Banners & Ads
                    </button>
                    <button
                        onClick={() => setMainTab("POLICIES")}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${mainTab === "POLICIES"
                                ? "bg-white text-neutral-900 shadow-sm"
                                : "text-neutral-600 hover:text-neutral-900"
                            }`}
                    >
                        <FileText className="h-4 w-4" /> Legal Pages CMS
                    </button>
                </div>
            </div>

            {/* SECTION 1: ADVERTISEMENTS */}
            {mainTab === "ADS" && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Create New Campaign
                        </button>
                    </div>

                    {/* Ads Data Table Rendering Code... */}
                    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                        {isLoadingAds ? (
                            <div className="flex items-center justify-center p-12 text-neutral-500 gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm font-medium">Loading campaigns...</span>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider">
                                        <tr>
                                            <th className="p-4">Campaign</th>
                                            <th className="p-4">Type</th>
                                            <th className="p-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                                        {filteredAds.map((ad) => (
                                            <tr key={ad.id}>
                                                <td className="p-4 font-bold">{ad.title}</td>
                                                <td className="p-4">{ad.type}</td>
                                                <td className="p-4">{ad.is_active ? "Active" : "Paused"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SECTION 2: LEGAL POLICIES CMS */}
            {mainTab === "POLICIES" && (
                <div className="space-y-6">
                    {/* Policy Tabs */}
                    <div className="flex items-center justify-between">
                        <div className="flex border-b border-neutral-200 pb-2 gap-2">
                            {[
                                { slug: "privacy-policy", label: "Privacy Policy" },
                                { slug: "terms-of-service", label: "Terms of Service" },
                                { slug: "payment-policy", label: "Payment Policy" },
                                { slug: "refund-cancel-policy", label: "Refund & Cancellation Policy" },
                            ].map((tab) => (
                                <button
                                    key={tab.slug}
                                    onClick={() => handlePolicyTabChange(tab.slug as PolicySlug)}
                                    className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${selectedSlug === tab.slug
                                            ? "bg-neutral-900 text-white shadow-sm"
                                            : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleSavePolicy}
                            disabled={isSavingPolicy}
                            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all disabled:opacity-50"
                        >
                            {isSavingPolicy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {isSavingPolicy ? "Saving..." : "Save Policy"}
                        </button>
                    </div>

                    {/* Policy Form */}
                    <form onSubmit={handleSavePolicy} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            {saveSuccess && (
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2 text-xs font-bold">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Policy changes saved successfully!
                                </div>
                            )}

                            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
                                <div>
                                    <label className="block text-neutral-700 font-bold text-xs mb-1">Page Title</label>
                                    <input
                                        type="text"
                                        value={policyTitle}
                                        onChange={(e) => setPolicyTitle(e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-bold text-neutral-900 outline-none focus:border-neutral-900"
                                    />
                                </div>

                                <div>
                                    <label className="block text-neutral-700 font-bold text-xs mb-1">Content (Markdown Supported)</label>
                                    <textarea
                                        rows={18}
                                        value={policyContent}
                                        onChange={(e) => setPolicyContent(e.target.value)}
                                        className="w-full rounded-xl border border-neutral-200 p-3 text-xs font-mono text-neutral-800 outline-none focus:border-neutral-900 leading-relaxed"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Sidebar */}
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                                    <Sparkles className="h-4 w-4 text-amber-500" /> Settings
                                </h3>

                                <button
                                    type="button"
                                    onClick={() => setPolicyPublished(!policyPublished)}
                                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all ${policyPublished ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-500"
                                        }`}
                                >
                                    <span>{policyPublished ? "Published" : "Draft Mode"}</span>
                                    <span className="text-[10px] underline">Toggle</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}