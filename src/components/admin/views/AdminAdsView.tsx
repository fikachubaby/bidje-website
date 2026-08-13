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
} from "lucide-react";
import { Advertisement, AdPlacement, AdType } from "@/types/ad";
import { supabase } from "@/lib/supabase/supabase";

export function AdminAdsView() {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"ALL" | AdType>("ALL");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form states
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<AdType>("BANNER");
    const [newPlacement, setNewPlacement] = useState<AdPlacement>("HOMEPAGE_HERO");
    const [newTargetUrl, setNewTargetUrl] = useState("");
    const [newCta, setNewCta] = useState("Learn More");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchAds = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/advertisements");
            const data = await res.json();
            if (Array.isArray(data)) {
                setAds(data);
            } else {
                console.error("API error:", data);
            }
        } catch (err) {
            console.error("Fetch failed:", err);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const toggleAdStatus = async (id: string, currentStatus: boolean) => {
        const res = await fetch(`/api/admin/advertisements/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: !currentStatus }),
        });

        if (res.ok) {
            setAds((prev) =>
                prev.map((ad) => (ad.id === id ? { ...ad, is_active: !currentStatus } : ad))
            );
        }
    };

    const handleDeleteAd = async (id: string) => {
        if (!confirm("Are you sure you want to delete this campaign?")) return;

        const res = await fetch(`/api/admin/advertisements/${id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            setAds((prev) => prev.filter((ad) => ad.id !== id));
        }
    };

    const handleCreateAd = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const res = await fetch("/api/admin/advertisements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,
                type: newType,
                placement: newPlacement,
                target_url: newTargetUrl,
                image_url: newImageUrl || null,
                cta_text: newCta,
                start_date: new Date().toISOString().split("T")[0],
                is_active: true,
                priority: 1,
            }),
        });

        if (res.ok) {
            const createdAd = await res.json();
            setAds([createdAd, ...ads]);
            setIsModalOpen(false);
            setNewTitle("");
            setNewTargetUrl("");
            setNewImageUrl("");
        }

        setIsSubmitting(false);
    };

    // Filters
    const filteredAds = ads.filter((ad) => {
        const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = activeTab === "ALL" || ad.type === activeTab;
        return matchesSearch && matchesType;
    });

    // Calculate high-level stats
    const totalImpressions = ads.reduce((acc, curr) => acc + (curr.impressions_count || 0), 0);
    const totalClicks = ads.reduce((acc, curr) => acc + (curr.clicks_count || 0), 0);
    const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : "0.0";
    const activeCount = ads.filter((ad) => ad.is_active).length;

    return (
        <div className="space-y-6 p-6 lg:p-8 bg-neutral-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                        Advertisement & Campaign Manager
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Control dynamic hero banners, featured property boosts, native ad placements, and promo popups.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-neutral-800 transition-all"
                >
                    <Plus className="h-4 w-4" />
                    Create New Campaign
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Active Campaigns</span>
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                            <Megaphone className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">{activeCount} / {ads.length}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Ad Views</span>
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <Eye className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">{totalImpressions.toLocaleString()}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Total Clicks</span>
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                            <MousePointerClick className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">{totalClicks.toLocaleString()}</p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Average CTR</span>
                        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                            <Sparkles className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="mt-2 text-2xl font-black text-neutral-900">{avgCtr}%</p>
                </div>
            </div>

            {/* Tabs & Search */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                    {(["ALL", "BANNER", "FEATURED_LISTING", "PROMO_CAMPAIGN"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${activeTab === tab
                                    ? "bg-neutral-900 text-white shadow-sm"
                                    : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                                }`}
                        >
                            {tab === "ALL" && "All Advertisements"}
                            {tab === "BANNER" && "Banners"}
                            {tab === "FEATURED_LISTING" && "Featured Deals"}
                            {tab === "PROMO_CAMPAIGN" && "Promotions"}
                        </button>
                    ))}
                </div>

                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search campaign..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white pl-9 pr-4 py-2 text-xs font-medium text-neutral-900 outline-none focus:border-neutral-900"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center p-12 text-neutral-500 gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">Loading campaigns from Supabase...</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Campaign & Placement</th>
                                    <th className="p-4">Type</th>
                                    <th className="p-4">Schedule</th>
                                    <th className="p-4">Performance</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 font-medium text-neutral-700">
                                {filteredAds.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center p-8 text-neutral-400">
                                            No advertisements found. Create your first campaign above!
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAds.map((ad) => (
                                        <tr key={ad.id} className="hover:bg-neutral-50/80 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-700 border border-neutral-200">
                                                        {ad.type === "FEATURED_LISTING" ? <Building2 className="h-5 w-5 text-amber-500" /> : <Megaphone className="h-5 w-5 text-blue-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-neutral-900 text-sm">{ad.title}</p>
                                                        <p className="text-[11px] text-neutral-400 mt-0.5 flex items-center gap-1">
                                                            <Tag className="h-3 w-3" /> Slot: <span className="font-mono text-neutral-600">{ad.placement}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${ad.type === "FEATURED_LISTING" ? "bg-amber-100 text-amber-800" :
                                                        ad.type === "PROMO_CAMPAIGN" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                                                    }`}>
                                                    {ad.type}
                                                </span>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center gap-1.5 text-neutral-600">
                                                    <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                                                    <span>{ad.start_date} {ad.end_date ? `→ ${ad.end_date}` : "(Ongoing)"}</span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1 text-neutral-600">
                                                    <p className="flex items-center gap-1"><Eye className="h-3 w-3 text-neutral-400" /> {(ad.impressions_count || 0).toLocaleString()} views</p>
                                                    <p className="flex items-center gap-1 font-bold text-neutral-900"><MousePointerClick className="h-3 w-3 text-neutral-400" /> {(ad.clicks_count || 0).toLocaleString()} clicks</p>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAdStatus(ad.id, ad.is_active)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${ad.is_active ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                                                        }`}
                                                >
                                                    {ad.is_active ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                                    {ad.is_active ? "Active" : "Paused"}
                                                </button>
                                            </td>

                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {ad.target_url && (
                                                        <a
                                                            href={ad.target_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100"
                                                            title="Preview Link"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteAd(ad.id)}
                                                        className="p-1.5 rounded-lg border border-neutral-200 text-red-500 hover:bg-red-50"
                                                        title="Delete Campaign"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Creation Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5">
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                            <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                                <Megaphone className="h-5 w-5 text-amber-500" /> Create New Campaign
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAd} className="space-y-4 text-xs font-medium">
                            <div>
                                <label className="block text-neutral-700 font-bold mb-1">Campaign Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Bangsar South Off-Market Deal Banner"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-neutral-700 font-bold mb-1">Ad Type</label>
                                    <select
                                        value={newType}
                                        onChange={(e) => setNewType(e.target.value as AdType)}
                                        className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 bg-white"
                                    >
                                        <option value="BANNER">Banner Image</option>
                                        <option value="FEATURED_LISTING">Featured Property Boost</option>
                                        <option value="PROMO_CAMPAIGN">Promotional Offer</option>
                                        <option value="HOMEPAGE_NATIVE">Homepage Native Card</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-neutral-700 font-bold mb-1">Placement Slot</label>
                                    <select
                                        value={newPlacement}
                                        onChange={(e) => setNewPlacement(e.target.value as AdPlacement)}
                                        className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900 bg-white"
                                    >
                                        <option value="TOP_ANNOUNCEMENT_BAR">Top Header Bar</option>
                                        <option value="HOMEPAGE_HERO">Homepage Hero</option>
                                        <option value="PROPERTY_FEED_NATIVE">Property Grid Native</option>
                                        <option value="HOMEPAGE_SIDEBAR">Homepage Sidebar</option>
                                        <option value="PROMO_MODAL">Popup Modal Overlay</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-bold mb-1">Destination URL / Property Link</label>
                                <input
                                    type="text"
                                    placeholder="https://bidje-website.vercel.app/properties/prop-1"
                                    value={newTargetUrl}
                                    onChange={(e) => setNewTargetUrl(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                                />
                            </div>

                            <div>
                                <label className="block text-neutral-700 font-bold mb-1">Banner Image URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="https://images.unsplash.com/..."
                                    value={newImageUrl}
                                    onChange={(e) => setNewImageUrl(e.target.value)}
                                    className="w-full rounded-xl border border-neutral-200 p-2.5 text-xs text-neutral-900 outline-none focus:border-neutral-900"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-neutral-900 px-5 py-2 text-xs font-bold text-white hover:bg-neutral-800 flex items-center gap-1.5"
                                >
                                    {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                    Save & Publish
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}