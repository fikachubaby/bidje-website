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
    CheckCircle2,
    AlertCircle,
    History,
    Upload
} from "lucide-react";
import Link from "next/link";

import type {
    PropertyListing,
    OfferHistoryItem,
    SupabasePropertyRecord,
    SupabaseOfferRecord
} from "@/types/property";
import { translate as t } from "@/lib/i18n/getTranslation";

export default function PropertyDashboardPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [selectedProperty, setSelectedProperty] = useState("");
    const [icFile, setIcFile] = useState<File | null>(null);
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [submittingOffer, setSubmittingOffer] = useState(false);
    const [offerMessage, setOfferMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [listings, setListings] = useState<PropertyListing[]>([]);
    const [offerHistory, setOfferHistory] = useState<OfferHistoryItem[]>([]);

    useEffect(() => {
        async function loadDashboardData() {
            setLoading(true);

            try {
                const { data: { user } } = await supabase.auth.getUser();

                // Determine if user is registered member
                const isMember = !!user;

                if (user) {
                    setUserId(user.id);
                    setUserEmail(user.email || "");
                    setFullName(user.user_metadata?.full_name || "Property Investor");
                }

                const selectFields = isMember
                    ? "id, title, district, state, asking_price, property_type, bedrooms, bathrooms, area_sqft, created_at, status"
                    : "id, title, property_type, bedrooms, bathrooms, area_sqft, created_at, status";

                const [offersResponse, propertiesResponse, invoicesResponse] = await Promise.all([
                    user
                        ? supabase
                            .from("offers")
                            .select("id, property_id, offer_price, status, submitted_at, ic_upload_url, payment_proof_url")
                            .eq("user_id", user.id)
                            .order("submitted_at", { ascending: false })
                        : Promise.resolve({ data: [], error: null }),

                    supabase
                        .from("properties")
                        .select(selectFields)
                        .eq("status", "Published")
                        .order("created_at", { ascending: false, nullsFirst: false })
                        .limit(9),

                    user
                        ? supabase
                            .from("offer_invoices")
                            .select("offer_id, invoice_url")
                            .eq("user_id", user.id)
                        : Promise.resolve({ data: [], error: null })
                ]);

                const propertyMap = new Map<string, SupabasePropertyRecord>();

                if (propertiesResponse.data && propertiesResponse.data.length > 0) {
                    const fetchedProps = propertiesResponse.data as unknown as SupabasePropertyRecord[];
                    fetchedProps.forEach((p) => propertyMap.set(p.id, p));

                    const formattedListings: PropertyListing[] = fetchedProps.map((p) => ({
                        id: p.id,
                        title: p.title || "Untitled Property",
                        location: isMember
                            ? `${p.district || ""}${p.district && p.state ? ", " : ""}${p.state || ""}` || "Location Unspecified"
                            : "Members Only",
                        price: isMember && p.asking_price
                            ? `RM ${Number(p.asking_price).toLocaleString()}`
                            : "Login to View Price",
                        type: p.property_type || "Property",
                        beds: Number(p.bedrooms) || 0,
                        baths: Number(p.bathrooms) || 0,
                        sqft: Number(p.area_sqft) || 0,
                        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=60"
                    }));

                    setListings(formattedListings);
                }

                if (user && !offersResponse.error && offersResponse.data) {
                    const typedOffers = offersResponse.data as unknown as SupabaseOfferRecord[];
                    const invoiceMap = new Map<string, string>();

                    if (invoicesResponse.data) {
                        invoicesResponse.data.forEach((inv: { offer_id: string; invoice_url: string }) => {
                            invoiceMap.set(inv.offer_id, inv.invoice_url);
                        });
                    }

                    const formattedOffers: OfferHistoryItem[] = typedOffers.map((item) => {
                        const matchedProp = item.property_id ? propertyMap.get(item.property_id) : undefined;
                        return {
                            id: item.id,
                            propertyTitle: matchedProp?.title || "Unknown Property",
                            offeredAmount: `RM ${Number(item.offer_price || 0).toLocaleString()}`,
                            status: item.status || "Pending",
                            dateSubmitted: item.submitted_at ? item.submitted_at.split("T")[0] : "",
                            icDocumentUrl: item.ic_upload_url,
                            paymentProofUrl: item.payment_proof_url,
                            invoiceUrl: invoiceMap.get(item.id) || null,
                        };
                    });
                    setOfferHistory(formattedOffers);
                }
            } catch (err) {
                console.error("Dashboard Load Error:", err);
            } finally {
                setLoading(false);
            }
        }

        void loadDashboardData();
    }, [supabase]);

    async function handleOfferSubmit(e: FormEvent) {
        e.preventDefault();
        setOfferMessage(null);

        if (!selectedProperty || !icFile) {
            setOfferMessage({ type: "error", text: "Please select your offer item and upload your IC document." });
            return;
        }

        if (!userId) {
            setOfferMessage({ type: "error", text: "You must be signed in to submit documents." });
            return;
        }

        setSubmittingOffer(true);

        try {
            const icPath = `offers/${userId}/ic-${Date.now()}-${icFile.name}`;
            const { error: icUploadError } = await supabase.storage.from("property-documents").upload(icPath, icFile);
            if (icUploadError) throw icUploadError;

            let proofPathValue = null;
            if (paymentProofFile) {
                const proofPath = `offers/${userId}/proof-${Date.now()}-${paymentProofFile.name}`;
                const { error: proofUploadError } = await supabase.storage.from("property-documents").upload(proofPath, paymentProofFile);
                if (!proofUploadError) {
                    proofPathValue = proofPath;
                }
            }

            const { data, error } = await supabase
                .from("offers")
                .update({
                    ic_upload_url: icPath,
                    payment_proof_url: proofPathValue,
                    status: "Pending",
                })
                .eq("id", selectedProperty)
                .eq("user_id", userId)
                .select("id, property_id, offer_price, status, submitted_at, ic_upload_url, payment_proof_url");

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error(
                    "No matching offer was found to update. This usually means the selected item isn't a valid pending offer on your account, or a database permission (RLS) policy is blocking access. Please pick an offer from the dropdown list and try again."
                );
            }

            const typedData = data[0] as unknown as SupabaseOfferRecord;

            setOfferHistory(prevHistory =>
                prevHistory.map(item =>
                    item.id === typedData.id
                        ? {
                            ...item,
                            icDocumentUrl: typedData.ic_upload_url,
                            paymentProofUrl: typedData.payment_proof_url,
                        }
                        : item
                )
            );

            setOfferMessage({ type: "success", text: "Verification documents uploaded and submitted successfully!" });

            setSelectedProperty("");
            setIcFile(null);
            setPaymentProofFile(null);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
            setOfferMessage({ type: "error", text: `Failed to upload documents: ${errorMessage}` });
        } finally {
            setSubmittingOffer(false);
        }
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
                        {t("Subscribers.welcome")} {fullName || "Subscriber"}!
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        {t("Subscribers.title1")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-sm">
                        <ShieldCheck className="h-4 w-4" />
                        {t("Subscribers.title2")}
                    </span>
                </div>
            </div>

            {/* Top Grid: Subscription Status & Profile Quick Overview */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <h2 className="text-lg font-bold text-black">{t("Subscribers.title3")}</h2>
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
                            {t("Subscribers.title4")}
                        </button>
                    </div>
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
                            <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                                <User className="h-5 w-5" />
                            </div>
                            <h2 className="text-lg font-bold text-black">{t("Subscribers.userProfile")}</h2>
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
                            <h2 className="text-lg font-bold text-black">{t("Subscribers.title5")}</h2>
                            <p className="text-xs text-neutral-500">{t("Subscribers.title5")}</p>
                        </div>
                    </div>
                    <span className="text-xs font-semibold bg-neutral-100 px-3 py-1 rounded-full text-neutral-600">
                        {offerHistory.length} {t("SubmitOfferModal.totalOffer")}
                    </span>
                </div>

                <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                                <th className="pb-3 px-3">Property</th>
                                <th className="pb-3 px-3">{t("SubmitOfferModal.fields.offerAmount.title")}</th>
                                <th className="pb-3 px-3">Date Submitted</th>
                                <th className="pb-3 px-3">Documents / Status</th>
                                <th className="pb-3 px-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 text-sm">
                            {offerHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-sm text-neutral-500">
                                        {t("SubmitOfferModal.noOffer")}
                                    </td>
                                </tr>
                            ) : (
                                offerHistory.map((offer) => {
                                    let badgeStyles = "bg-amber-50 text-amber-800 border-amber-200";
                                    if (offer.status === "Accepted") badgeStyles = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                    if (offer.status === "Rejected") badgeStyles = "bg-red-50 text-red-800 border-red-200";

                                    return (
                                        <tr key={offer.id} className="hover:bg-neutral-50/50 transition-colors">
                                            <td className="py-4 px-3 font-semibold text-black align-top">{offer.propertyTitle}</td>
                                            <td className="py-4 px-3 text-neutral-800 align-top">{offer.offeredAmount}</td>
                                            <td className="py-4 px-3 text-neutral-500 align-top">{offer.dateSubmitted}</td>
                                            <td className="py-4 px-3 align-top text-xs text-neutral-600">
                                                <div className="space-y-1">
                                                    <p className="font-medium text-black">
                                                        {offer.icDocumentUrl ? "✓ IC Submitted" : "⚠️ Missing IC"}
                                                    </p>
                                                    <p className="text-neutral-500">
                                                        {offer.paymentProofUrl ? "✓ Payment Proof Attached" : "No Proof Attached"}
                                                    </p>
                                                    {offer.invoiceUrl && (
                                                        <a href={offer.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline block mt-1">
                                                            View Invoice
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-3 align-top">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border ${badgeStyles}`}>
                                                    {offer.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
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
                        <h2 className="text-lg font-bold text-black">{t("SubmitOfferModal.title1")}</h2>
                        <p className="text-xs text-neutral-500">{t("SubmitOfferModal.message1")}</p>
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
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">
                                Select Your Property Offer <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedProperty}
                                onChange={(e) => setSelectedProperty(e.target.value)}
                                className="mt-1.5 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm text-black bg-white focus:border-black focus:outline-none shadow-sm"
                            >
                                <option value="">-- Choose from your active property offers --</option>
                                {offerHistory.map(offer => (
                                    <option key={offer.id} value={offer.id}>
                                        {offer.propertyTitle} — {offer.offeredAmount} (Status: {offer.status})
                                    </option>
                                ))}
                            </select>
                            {offerHistory.length === 0 && (
                                <p className="mt-1 text-xs text-amber-600">
                                    {t("SubmitOfferModal.message2")}
                                </p>
                            )}
                        </div>

                        {/* Upload Identity Card (IC) - Required */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">{t("SubmitOfferModal.message2")} <span className="text-red-500">*</span></label>
                            <div className="mt-1.5 rounded-2xl border border-dashed border-neutral-300 p-4 text-center hover:bg-neutral-50 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    id="ic-upload-input"
                                    onChange={(e) => e.target.files && setIcFile(e.target.files[0])}
                                    className="hidden"
                                />
                                <label htmlFor="ic-upload-input" className="cursor-pointer block">
                                    <p className="text-xs font-semibold text-black">{icFile ? icFile.name : "Click to upload IC file"}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">{t("Authentication.format")}</p>
                                </label>
                            </div>
                            {icFile && <p className="mt-1 text-xs font-medium text-emerald-600">✓ IC Attached</p>}
                        </div>

                        {/* Upload Offer Fee Payment Proof - Optional */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700">Upload Payment Proof <span className="text-neutral-400 font-normal">(Optional)</span></label>
                            <div className="mt-1.5 rounded-2xl border border-dashed border-neutral-300 p-4 text-center hover:bg-neutral-50 transition-colors">
                                <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    id="proof-upload-input"
                                    onChange={(e) => e.target.files && setPaymentProofFile(e.target.files[0])}
                                    className="hidden"
                                />
                                <label htmlFor="proof-upload-input" className="cursor-pointer block">
                                    <p className="text-xs font-semibold text-black">{paymentProofFile ? paymentProofFile.name : "Click to upload receipt"}</p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">{t("Authentication.format")}</p>
                                </label>
                            </div>
                            {paymentProofFile && <p className="mt-1 text-xs font-medium text-emerald-600">✓ Receipt Attached</p>}
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={submittingOffer}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-sm font-bold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50 shadow-sm"
                        >
                            {submittingOffer && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Offer & Required Documents
                        </button>
                    </div>
                </form>
            </div>

            {/* Property Offer Listings Section */}
            <div className="space-y-8">
                {/* Property Offer Listings Section */}
                <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-neutral-100 p-2.5 text-black">
                                <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-black">Latest Property Listings</h2>
                                <p className="text-xs text-neutral-500">Showing top 5 newly added properties</p>
                            </div>
                        </div>

                        {/* Browse More Properties Link */}
                        <Link
                            href="/properties"
                            className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800 w-fit"
                        >
                            Browse All Properties
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.length === 0 ? (
                            <p className="col-span-full py-8 text-center text-sm text-neutral-500">
                                No published property listings available at the moment.
                            </p>
                        ) : (
                            listings.map((item) => (
                                <div key={item.id} className="group rounded-2xl border border-neutral-200 overflow-hidden bg-white transition-all hover:border-black flex flex-col justify-between">
                                    <div>
                                        <div className="relative h-48 w-full overflow-hidden bg-neutral-100">
                                            <Image
                                                src={item.image}
                                                alt={item.title || "Property listing image"}
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
                                                const matchingOffer = offerHistory.find(
                                                    (o) => o.propertyTitle === item.title
                                                );
                                                if (matchingOffer) {
                                                    setSelectedProperty(matchingOffer.id);
                                                    setOfferMessage(null);
                                                } else {
                                                    setSelectedProperty("");
                                                    setOfferMessage({
                                                        type: "error",
                                                        text: "You don't have a pending offer for this property yet. Please select an existing offer from the dropdown below.",
                                                    });
                                                }
                                                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                                            }}
                                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-100 py-3 text-xs font-bold text-black transition-colors hover:bg-black hover:text-white"
                                        >
                                            Select Offer <ExternalLink className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}