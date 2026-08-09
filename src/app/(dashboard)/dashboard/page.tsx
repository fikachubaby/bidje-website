"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import {
    Building2,
    CreditCard,
    Clock,
    User,
    ShieldCheck,
    ArrowRight,
    Loader2,
    MapPin,
    Bed,
    Bath,
    Square,
    Heart,
    ExternalLink,
    FileText,
    Upload,
    CheckCircle2,
    AlertCircle,
    History
} from "lucide-react";
import Link from "next/link";

interface PropertyListing {
    id: string;
    title: string;
    location: string;
    price: string;
    type: string;
    beds: number;
    baths: number;
    sqft: number;
    image: string;
}

interface OfferHistoryItem {
    id: string;
    propertyTitle: string;
    offeredAmount: string;
    status: "Pending" | "Accepted" | "Rejected";
    dateSubmitted: string;
    icFileName?: string;
    paymentProofName?: string;
}

export default function PropertyDashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");
    const [fullName, setFullName] = useState("");

    // Offer form states
    const [selectedProperty, setSelectedProperty] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [icFile, setIcFile] = useState<File | null>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [submittingOffer, setSubmittingOffer] = useState(false);
    const [offerMessage, setOfferMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [listings] = useState<PropertyListing[]>([
        {
            id: "1",
            title: "TRX Residences Luxury Service Suite",
            location: "TRX, Kuala Lumpur",
            price: "RM 3,200 /mo",
            type: "Condominium",
            beds: 2,
            baths: 2,
            sqft: 850,
            image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60"
        },
        {
            id: "2",
            title: "Modern Freehold Link Terrace",
            location: "Setia Alam, Selangor",
            price: "RM 780,000",
            type: "Terrace House",
            beds: 4,
            baths: 3,
            sqft: 2100,
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60"
        },
        {
            id: "3",
            title: "Studio Unit near LRT Station",
            location: "Bangsar South, Kuala Lumpur",
            price: "RM 1,900 /mo",
            type: "SoHo",
            beds: 1,
            baths: 1,
            sqft: 520,
            image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60"
        }
    ]);

    // Mock initial offer history log
    const [offerHistory, setOfferHistory] = useState<OfferHistoryItem[]>([
        {
            id: "off-101",
            propertyTitle: "TRX Residences Luxury Service Suite",
            offeredAmount: "RM 3,100 /mo",
            status: "Pending",
            dateSubmitted: "2026-03-08",
            icFileName: "ic_copy_ahmad.pdf",
            paymentProofName: "rm500_fee_trx.pdf"
        },
        {
            id: "off-102",
            propertyTitle: "Modern Freehold Link Terrace",
            offeredAmount: "RM 750,000",
            status: "Accepted",
            dateSubmitted: "2026-02-14",
            icFileName: "ic_front_back.png",
            paymentProofName: "receipt_setia_alam.pdf"
        }
    ]);

    useEffect(() => {
        async function loadUserData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || "");
                setFullName(user.user_metadata?.full_name || "Property Investor");
            }
            setLoading(false);
        }
        loadUserData();
    }, [supabase]);

    async function handleOfferSubmit(e: FormEvent) {
        e.preventDefault();
        setOfferMessage(null);

        if (!selectedProperty || !offerPrice || !icFile || !paymentProofFile) {
            setOfferMessage({ type: "error", text: "Please fill in all offer fields and upload both required documents." });
            return;
        }

        setSubmittingOffer(true);

        // Simulate network/database request for offer upload & document submission
        setTimeout(() => {
            const targetListing = listings.find(l => l.id === selectedProperty);
            const newEntry: OfferHistoryItem = {
                id: `off-${Date.now()}`,
                propertyTitle: targetListing ? targetListing.title : "Selected Property",
                offeredAmount: offerPrice,
                status: "Pending",
                dateSubmitted: new Date().toISOString().split("T")[0],
                icFileName: icFile.name,
                paymentProofName: paymentProofFile.name
            };

            setOfferHistory([newEntry, ...offerHistory]);
            setOfferMessage({ type: "success", text: "Offer and verification documents submitted successfully! Status is now Pending." });

            // Reset form
            setSelectedProperty("");
            setOfferPrice("");
            setIcFile(null);
            setPaymentProofFile(null);
            setSubmittingOffer(false);
        }, 1000);
    }

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    const subscription = {
        plan: "Subscriber Pass (Direct Owner Access)",
        price: "RM 2.00",
        billingCycle: "Monthly",
        status: "Active",
        autoExpiryDate: "2026-03-12",
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-12">
            {/* Header / Welcome Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">
                        Welcome back, {fullName || "Subscriber"}!
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage your property bids, review offer history status, and upload verification files.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-sm">
                        <ShieldCheck className="h-4 w-4" />
                        Subscriber Tier Unlocked
                    </span>
                </div>
            </div>

            {/* Top Grid: Subscription Status & Profile Quick Overview */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Subscription Status & Auto Expiry Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-black">Subscription & Billing</h2>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                {subscription.status}
                            </span>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-2xl bg-neutral-50 p-4 border border-neutral-100">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Active Plan</p>
                                    <p className="text-sm font-bold text-black mt-0.5">{subscription.plan}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Fee</p>
                                    <p className="text-base font-bold text-black">{subscription.price} <span className="text-xs font-normal text-neutral-500">/mo</span></p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between px-2 text-sm">
                                <span className="flex items-center gap-2 text-neutral-600">
                                    <Clock className="h-4 w-4 text-neutral-400" />
                                    Auto-Expiry / Next Renewal:
                                </span>
                                <span className="font-semibold text-black">{subscription.autoExpiryDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100">
                        <button
                            onClick={() => alert("Redirecting to secure billing portal for auto-renewal settings.")}
                            className="w-full rounded-2xl bg-black py-3 text-sm font-bold text-white transition-colors hover:bg-neutral-800 shadow-sm"
                        >
                            Manage Auto-Renewal Settings
                        </button>
                    </div>
                </div>

                {/* User Profile Overview Card */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                            <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                                <User className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-black">User Profile</h2>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Full Name</p>
                                <p className="mt-1 text-base font-medium text-black">{fullName || "Not specified"}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Email Address</p>
                                <p className="mt-1 text-base font-medium text-black">{userEmail}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-neutral-100">
                        <Link
                            href="/profile"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-50"
                        >
                            Edit Profile & Security <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

            </div>

            {/* Offer History & Status Tracker Section */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <History className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-black">Offer History Log</h2>
                            <p className="text-xs text-neutral-500">Track the status of your purchase and rental bids</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
                        {offerHistory.length} Total Offers
                    </span>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                <th className="pb-3 px-3">Property</th>
                                <th className="pb-3 px-3">Offer Amount</th>
                                <th className="pb-3 px-3">Date Submitted</th>
                                <th className="pb-3 px-3">Documents</th>
                                <th className="pb-3 px-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-sm">
                            {offerHistory.map((offer) => {
                                let badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
                                if (offer.status === "Accepted") badgeStyles = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                if (offer.status === "Rejected") badgeStyles = "bg-red-50 text-red-800 border-red-200";

                                return (
                                    <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                                        <td className="py-4 px-3 font-semibold text-black">{offer.propertyTitle}</td>
                                        <td className="py-4 px-3 text-neutral-800">{offer.offeredAmount}</td>
                                        <td className="py-4 px-3 text-neutral-500">{offer.dateSubmitted}</td>
                                        <td className="py-4 px-3">
                                            <div className="flex flex-col gap-0.5 text-xs text-neutral-600">
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-neutral-400" /> IC: {offer.icFileName || "Uploaded"}</span>
                                                <span className="flex items-center gap-1"><FileText className="h-3 w-3 text-neutral-400" /> Fee Proof: {offer.paymentProofName || "Uploaded"}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeStyles}`}>
                                                {offer.status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Make an Offer & Upload Documents Section */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                    <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                        <Upload className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-black">Submit New Property Offer & Documents</h2>
                        <p className="text-xs text-neutral-500">Attach your IC and RM 500 offer processing payment receipt to lock your bid</p>
                    </div>
                </div>

                <form onSubmit={handleOfferSubmit} className="mt-6 space-y-6">
                    {offerMessage && (
                        <div className={`flex items-center gap-2 rounded-2xl p-4 text-sm ${offerMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
                            {offerMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                            <span>{offerMessage.text}</span>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Select Property</label>
                            <select
                                value={selectedProperty}
                                onChange={(e) => setSelectedProperty(e.target.value)}
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black bg-white focus:border-black focus:outline-none"
                            >
                                <option value="">-- Choose a property listing --</option>
                                {listings.map(l => (
                                    <option key={l.id} value={l.id}>{l.title} ({l.price})</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Your Offer Amount (RM)</label>
                            <input
                                type="text"
                                placeholder="e.g. RM 3,100 /mo or RM 750,000"
                                value={offerPrice}
                                onChange={(e) => setOfferPrice(e.target.value)}
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black focus:border-black focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Upload Identity Card (IC Copy)</label>
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => e.target.files && setIcFile(e.target.files[0])}
                                className="mt-1.5 w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-black hover:file:bg-neutral-200 cursor-pointer"
                            />
                            {icFile && <p className="mt-1 text-xs text-emerald-600">Selected: {icFile.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Upload Offer Fee Proof (RM 500 Payment Receipt)</label>
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => e.target.files && setPaymentProofFile(e.target.files[0])}
                                className="mt-1.5 w-full text-xs text-neutral-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-black hover:file:bg-neutral-200 cursor-pointer"
                            />
                            {paymentProofFile && <p className="mt-1 text-xs text-emerald-600">Selected: {paymentProofFile.name}</p>}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submittingOffer}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-3.5 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                        >
                            {submittingOffer && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Offer & Required Documents
                        </button>
                    </div>
                </form>
            </div>

            {/* Property Offer Listings Section */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-2">
                    <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-black">Featured Property Listings</h2>
                            <p className="text-xs text-neutral-500">Exclusive directly sourced listings available to active subscribers</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-600 w-fit">
                        {listings.length} Active Listings Found
                    </span>
                </div>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {listings.map((item) => (
                        <div key={item.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white transition-all hover:border-black flex flex-col justify-between">
                            <div>
                                <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white text-black shadow-sm">
                                        <Heart className="h-4 w-4" />
                                    </div>
                                    <div className="absolute bottom-3 left-3 z-10 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                                        {item.type}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="text-lg font-bold text-black">{item.price}</div>
                                    <h3 className="mt-1 font-semibold text-neutral-900 line-clamp-1">{item.title}</h3>

                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
                                        <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                        <span className="truncate">{item.location}</span>
                                    </div>

                                    <div className="mt-4 grid grid-cols-3 gap-2 py-3 border-t border-b border-neutral-100 text-xs text-neutral-600">
                                        <div className="flex items-center gap-1">
                                            <Bed className="h-4 w-4 text-neutral-400" />
                                            <span>{item.beds} Beds</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Bath className="h-4 w-4 text-neutral-400" />
                                            <span>{item.baths} Baths</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Square className="h-4 w-4 text-neutral-400" />
                                            <span>{item.sqft} sqft</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => {
                                        setSelectedProperty(item.id);
                                        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                    }}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
                                >
                                    Make an Offer <ExternalLink className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}