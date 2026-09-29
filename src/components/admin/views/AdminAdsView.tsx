"use client";

import React, { useState, useEffect } from "react";
import {
    Megaphone,
    Plus,
    Search,
    Eye,
    ExternalLink,
    Trash2,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    FileText,
    Save,
    Edit,
    Power,
} from "lucide-react";
import { Advertisement, AdPlacement, AdType } from "@/types/ad";
import { PolicyDocument, PolicySlug } from "@/types/legal";
import { ImageDropzone } from "@/components/admin/property/ImageDropzone";

export function AdminAdsView() {
    const [mainTab, setMainTab] = useState<"ADS" | "POLICIES">("ADS");

    // ==========================================
    // ADVERTISEMENT MANAGEMENT STATES & LOGIC
    // ==========================================
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoadingAds, setIsLoadingAds] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"ALL" | AdType>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
    const [previewAd, setPreviewAd] = useState<Advertisement | null>(null);

    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<AdType>("BANNER");
    const [newPlacement, setNewPlacement] = useState<AdPlacement>("HOMEPAGE_HERO");
    const [newTargetUrl, setNewTargetUrl] = useState("");
    const [newCta, setNewCta] = useState("Learn More");
    const [newImageUrl, setNewImageUrl] = useState("");

    // Dropzone Upload States
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState("");
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

    const resetAdForm = () => {
        setEditingAd(null);
        setNewTitle("");
        setNewType("BANNER");
        setNewPlacement("HOMEPAGE_HERO");
        setNewTargetUrl("");
        setNewCta("Learn More");
        setNewImageUrl("");
        setUploadError("");
    };

    const openEditModal = (ad: Advertisement) => {
        setEditingAd(ad);
        setNewTitle(ad.title);
        setNewType(ad.type);
        setNewPlacement(ad.placement);
        setNewTargetUrl(ad.target_url || "");
        setNewCta(ad.cta_text || "Learn More");
        setNewImageUrl(ad.image_url || "");
        setIsModalOpen(true);
    };

    const handleUploadFiles = (files: FileList | File[]) => {
        setIsUploadingImage(true);
        setUploadError("");

        const file = files[0];
        if (!file) {
            setIsUploadingImage(false);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setNewImageUrl(e.target.result as string);
            }
            setIsUploadingImage(false);
        };
        reader.onerror = () => {
            setUploadError("Failed to read image file.");
            setIsUploadingImage(false);
        };
        reader.readAsDataURL(file);
    };

    const handleToggleActive = async (ad: Advertisement) => {
        try {
            const updatedStatus = !ad.is_active;
            const res = await fetch(`/api/admin/advertisements/${ad.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: updatedStatus }),
            });

            if (res.ok) {
                setAds((prev) =>
                    prev.map((item) =>
                        item.id === ad.id ? { ...item, is_active: updatedStatus } : item
                    )
                );
            }
        } catch (err) {
            console.error("Failed to toggle advertisement status:", err);
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm("Are you sure you want to delete this advertisement campaign?")) return;
        try {
            const res = await fetch(`/api/admin/advertisements/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                setAds((prev) => prev.filter((item) => item.id !== id));
            }
        } catch (err) {
            console.error("Failed to delete advertisement:", err);
        }
    };

    const handleSaveAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            title: newTitle,
            type: newType,
            placement: newPlacement,
            target_url: newTargetUrl,
            cta_text: newCta,
            image_url: newImageUrl,
            is_active: true,
            start_date: new Date().toISOString(),
        };

        try {
            const url = editingAd
                ? `/api/admin/advertisements/${editingAd.id}`
                : "/api/admin/advertisements";
            const method = editingAd ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                const savedAd = await res.json();
                if (editingAd) {
                    setAds((prev) => prev.map((item) => (item.id === savedAd.id ? savedAd : item)));
                } else {
                    setAds((prev) => [savedAd, ...prev]);
                }
                setIsModalOpen(false);
                resetAdForm();
            }
        } catch (err) {
            console.error("Failed to save advertisement:", err);
        }

        setIsSubmitting(false);
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

    const filteredAds = ads.filter((ad) => {
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = activeTab === "ALL" || ad.type === activeTab;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6 p-6 lg:p-8 bg-neutral-50 min-h-screen">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        Content & Campaign Control Center
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Manage promotions, advertisement banners, and public legal policies.
                    </p>
                </div>

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

            {mainTab === "ADS" && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Search campaigns..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-neutral-900"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                resetAdForm();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all"
                        >
                            <Plus className="h-4 w-4" /> Create New Campaign
                        </button>
                    </div>

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
                                            <th className="p-4">Preview</th>
                                            <th className="p-4">Campaign Title</th>
                                            <th className="p-4">Type / Placement</th>
                                            <th className="p-4">Status</th>
                                            <th className="p-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                                        {filteredAds.map((ad) => (
                                            <tr key={ad.id} className="hover:bg-neutral-50/50">
                                                <td className="p-4">
                                                    {ad.image_url ? (
                                                        <img
                                                            src={ad.image_url}
                                                            alt={ad.title}
                                                            className="h-10 w-16 object-cover rounded-md border border-neutral-200"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-16 bg-neutral-100 rounded-md border border-neutral-200 flex items-center justify-center text-[10px] text-neutral-400">
                                                            No Image
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 font-bold text-neutral-900">{ad.title}</td>
                                                <td className="p-4">
                                                    <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold mr-1">
                                                        {ad.type}
                                                    </span>
                                                    <span className="text-neutral-500 text-[11px]">{ad.placement}</span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleToggleActive(ad)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${ad.is_active
                                                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                                                : "bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
                                                            }`}
                                                    >
                                                        <Power className="h-3 w-3" />
                                                        {ad.is_active ? "Published" : "Deactivated"}
                                                    </button>
                                                </td>
                                                <td className="p-4 text-right space-x-2">
                                                    <button
                                                        onClick={() => setPreviewAd(ad)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                                                        title="View Campaign"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(ad)}
                                                        className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                                                        title="Edit Campaign"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteAd(ad.id)}
                                                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                                                        title="Delete Campaign"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Preview Modal */}
                    {previewAd && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <h3 className="font-bold text-neutral-900 text-base">{previewAd.title}</h3>
                                    <button onClick={() => setPreviewAd(null)} className="text-neutral-400 hover:text-neutral-600">
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                {previewAd.image_url && (
                                    <img src={previewAd.image_url} alt={previewAd.title} className="w-full max-h-64 object-cover rounded-xl" />
                                )}
                                <div className="text-xs space-y-2 text-neutral-600">
                                    <p><strong>Placement:</strong> {previewAd.placement}</p>
                                    <p><strong>Type:</strong> {previewAd.type}</p>
                                    <p><strong>Target URL:</strong> {previewAd.target_url || "N/A"}</p>
                                    <p><strong>Status:</strong> {previewAd.is_active ? "Published" : "Deactivated"}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Create / Edit Modal */}
                    {isModalOpen && (
                        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
                                <div className="flex justify-between items-center border-b pb-3">
                                    <h3 className="text-base font-black text-neutral-900">
                                        {editingAd ? "Edit Campaign" : "Create New Campaign"}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            resetAdForm();
                                        }}
                                        className="text-neutral-400 hover:text-neutral-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                <form onSubmit={handleSaveAd} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                            Campaign Title
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="e.g. Summer Special Offer"
                                            className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-semibold outline-none focus:border-neutral-900"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                                Type
                                            </label>
                                            <select
                                                value={newType}
                                                onChange={(e) => setNewType(e.target.value as AdType)}
                                                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-semibold outline-none focus:border-neutral-900"
                                            >
                                                <option value="BANNER">Banner</option>
                                                <option value="CARD">Card</option>
                                                <option value="POPUP">Popup</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                                Placement
                                            </label>
                                            <select
                                                value={newPlacement}
                                                onChange={(e) => setNewPlacement(e.target.value as AdPlacement)}
                                                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-semibold outline-none focus:border-neutral-900"
                                            >
                                                <option value="HOMEPAGE_HERO">Homepage Hero</option>
                                                <option value="SIDEBAR">Sidebar</option>
                                                <option value="PROPERTY_LIST">Property List</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                            Campaign Media
                                        </label>
                                        <ImageDropzone
                                            images={newImageUrl ? [newImageUrl] : []}
                                            uploading={isUploadingImage}
                                            uploadError={uploadError}
                                            onUploadFiles={handleUploadFiles}
                                            onAddUrl={(url) => setNewImageUrl(url)}
                                            onRemoveImage={() => setNewImageUrl("")}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                                Target URL
                                            </label>
                                            <input
                                                type="url"
                                                value={newTargetUrl}
                                                onChange={(e) => setNewTargetUrl(e.target.value)}
                                                placeholder="https://example.com/promo"
                                                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-semibold outline-none focus:border-neutral-900"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">
                                                CTA Button Text
                                            </label>
                                            <input
                                                type="text"
                                                value={newCta}
                                                onChange={(e) => setNewCta(e.target.value)}
                                                placeholder="Learn More"
                                                className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs font-semibold outline-none focus:border-neutral-900"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                resetAdForm();
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || isUploadingImage}
                                            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 inline-flex items-center gap-2"
                                        >
                                            {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                            {editingAd ? "Save Changes" : "Create Campaign"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: LEGAL POLICIES CMS */}
            {mainTab === "POLICIES" && (
                <div className="space-y-6">
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

                        <div className="space-y-4">
                            <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm space-y-4">
                                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                                    Settings
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
