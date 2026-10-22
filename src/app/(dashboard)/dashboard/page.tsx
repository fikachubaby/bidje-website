"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Building2, CheckCircle2, CreditCard, FileText, Heart, Home, Landmark, LayoutGrid, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { translate as t } from "@/lib/i18n/getTranslation";
import type { PropertyListing } from "@/types/property";
import type { OfferHistoryItem } from "@/types/offer";
import { SubmitOfferModal } from "@/components/property/SubmitOfferModal";
import { useSubscription } from "@/hooks/useSubscription";
import { useWishlist } from "@/hooks/useWishlist";
import { useFinancingScreening } from "@/hooks/useFinancingScreening";
import { SCREENING_STATUS_META } from "@/constants/financing-screening";

import { FeaturedListings, PropertyModal } from "../properties";
import { OfferHistoryTable, OfferSubmitForm, useOfferHistory } from "../offers";
import { useDashboardUser } from "../useDashboardUser";
import { SubscriptionCard } from "./_components/SubscriptionCard";
import { MyListings } from "./_components/MyListings";
import { buildNextSteps, NextSteps, type DashboardTab } from "./_components/NextSteps";

const TABS: { key: DashboardTab; label: string; icon: typeof LayoutGrid }[] = [
    { key: "overview", label: "Overview", icon: LayoutGrid },
    { key: "deals", label: "Find deals", icon: Building2 },
    { key: "offers", label: "My offers", icon: FileText },
    { key: "listings", label: "My listings", icon: Home },
    { key: "billing", label: "Billing", icon: CreditCard },
];

const PAYMENT_MESSAGES: Record<string, [type: "success" | "error" | "info", text: string]> = {
    success: ["success", "Payment received — your subscription is active."],
    pending: ["info", "Payment is processing. We'll update your plan as soon as Fiuu confirms."],
    failed: ["error", "Payment wasn't completed. You can try again anytime."],
    cancelled: ["info", "Payment cancelled."],
};

const TONE_CLASS = {
    neutral: "text-neutral-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
    green: "text-emerald-700",
    red: "text-red-700",
} as const;

interface StatProps {
    label: string;
    value: string | number;
    hint: string;
    icon: typeof LayoutGrid;
    valueClassName?: string;
    href?: string;
    onClick?: () => void;
}

/** Overview card; links or switches tab when clicked. */
function Stat({ label, value, hint, icon: Icon, valueClassName, href, onClick }: StatProps) {
    const body = (
        <>
            <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{label}</p>
                <Icon className="h-4 w-4 text-neutral-400" />
            </div>
            <p className={cn("mt-1 font-black", typeof value === "number" ? "text-2xl" : "text-sm leading-6", valueClassName)}>{value}</p>
            <p className="mt-0.5 text-[11px] text-neutral-500">{hint}</p>
        </>
    );
    const className = "block rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-colors hover:border-black";
    if (href) return <Link href={href} className={className}>{body}</Link>;
    return <button type="button" onClick={onClick} className={className}>{body}</button>;
}

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { loading: userLoading, isMember, userId, fullName } = useDashboardUser();
    const { offerHistory, reload: reloadOffers, submitOfferDocuments } = useOfferHistory(userId, isMember);
    const billing = useSubscription();
    const wishlist = useWishlist();
    const { screening } = useFinancingScreening(isMember);

    const tab = (searchParams.get("tab") as DashboardTab) || "overview";
    const [activeModalProperty, setActiveModalProperty] = useState<PropertyListing | null>(null);
    const [offerFor, setOfferFor] = useState<PropertyListing | null>(null);
    const [selectedOfferId, setSelectedOfferId] = useState("");

    const setTab = (next: DashboardTab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", next);
        params.delete("payment");
        router.push(`?${params.toString()}`, { scroll: false });
    };

    // Fiuu sends shoppers back with ?payment=...; show the result once.
    const paymentResult = searchParams.get("payment");
    useEffect(() => {
        const msg = paymentResult && PAYMENT_MESSAGES[paymentResult];
        if (!msg) return;
        const [type, text] = msg;
        if (type === "success") toast.success(text);
        else if (type === "error") toast.error(text);
        else toast(text);
        void billing.refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentResult]);

    const stats = useMemo(() => {
        const is = (re: RegExp) => offerHistory.filter((o) => re.test(o.status)).length;
        return {
            total: offerHistory.length,
            verifying: is(/verif/i),
            accepted: is(/accept|approved|success/i),
        };
    }, [offerHistory]);

    const steps = buildNextSteps(offerHistory, billing.subscription);
    const needsDocsId = offerHistory.find((o) => !o.icDocumentUrl)?.id ?? "";

    function handleViewOfferDetails(offer: OfferHistoryItem) {
        if (offer.propertyData) setActiveModalProperty(offer.propertyData);
    }

    // "Select Offer" on a listing opens the real offer form; an existing offer jumps to its documents.
    function handleSelectListing(listing: PropertyListing) {
        const existing = offerHistory.find((o) => o.propertyId === listing.id);
        if (existing) {
            setSelectedOfferId(existing.id);
            setTab("offers");
            toast("You already made an offer on this property — add your documents below.");
            return;
        }
        setOfferFor(listing);
    }

    if (userLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    const sub = billing.subscription;
    const planPill =
        sub?.status === "active"
            ? { text: `Subscribed · ${sub.autoRenew ? "renews" : "ends"} ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}`, className: "bg-emerald-50 text-emerald-800 border-emerald-200" }
            : sub?.status === "past_due"
              ? { text: "Payment issue", className: "bg-amber-50 text-amber-800 border-amber-200" }
              : { text: "Not subscribed", className: "bg-neutral-100 text-neutral-600 border-neutral-200" };

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                        {t("Subscribers.welcome")} {fullName?.split(" ")[0] || "there"} 👋
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">{t("Subscribers.title1")}</p>
                </div>
                <button
                    type="button"
                    onClick={() => setTab("billing")}
                    className={cn("self-start rounded-full border px-3.5 py-1.5 text-xs font-bold sm:self-auto", planPill.className)}
                >
                    {planPill.text}
                </button>
            </div>

            {/* Tabs */}
            <nav className="sticky top-[76px] z-20 -mx-4 flex gap-1 overflow-x-auto border-b border-neutral-200 bg-neutral-50/95 px-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:p-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setTab(key)}
                        className={cn(
                            "flex shrink-0 items-center gap-2 whitespace-nowrap px-3 py-3 text-sm font-bold transition-colors sm:rounded-xl sm:py-2",
                            tab === key
                                ? "border-b-2 border-black text-black sm:border-0 sm:bg-black sm:text-brand"
                                : "text-neutral-500 hover:text-black"
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                        {key === "offers" && stats.total > 0 && (
                            <span className="rounded-full bg-neutral-200 px-1.5 text-[10px] text-black">{stats.total}</span>
                        )}
                    </button>
                ))}
            </nav>

            {tab === "overview" && (
                <div className="space-y-6">
                    <NextSteps steps={steps} onGo={setTab} />
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                        <Stat label="Wishlist" value={wishlist.ids.size} hint="Saved properties" icon={Heart} href="/settings#wishlist" />
                        <Stat label="Submitted" value={stats.total} hint="Offers made" icon={Send} onClick={() => setTab("offers")} />
                        <Stat label="Verifying" value={stats.verifying} hint="Being checked" icon={BadgeCheck} onClick={() => setTab("offers")} />
                        <Stat label="Accepted" value={stats.accepted} hint="Offers accepted" icon={CheckCircle2} onClick={() => setTab("offers")} />
                        <Stat
                            label="Loan capability"
                            value={screening ? SCREENING_STATUS_META[screening.status].label : "Not screened"}
                            valueClassName={screening ? TONE_CLASS[SCREENING_STATUS_META[screening.status].tone] : "text-neutral-500"}
                            hint={screening ? "Financing screening" : "Done when you make an offer"}
                            icon={Landmark}
                            href="/settings#account"
                        />
                    </div>
                    <FeaturedListings isMember={isMember} onSelect={handleSelectListing} actionLabel="Make Offer" limit={3} />
                </div>
            )}

            {tab === "deals" && <FeaturedListings isMember={isMember} onSelect={handleSelectListing} actionLabel="Make Offer" />}

            {tab === "offers" && (
                <div className="space-y-6">
                    <OfferSubmitForm
                        userId={userId}
                        offerHistory={offerHistory}
                        selectedOfferId={selectedOfferId || needsDocsId}
                        onSelectedOfferIdChange={setSelectedOfferId}
                        onSubmit={submitOfferDocuments}
                    />
                    <OfferHistoryTable offerHistory={offerHistory} loading={false} onViewDetails={handleViewOfferDetails} />
                </div>
            )}

            {tab === "listings" && <MyListings />}

            {tab === "billing" && (
                <div className="mx-auto max-w-xl">
                    <SubscriptionCard billing={billing} />
                </div>
            )}

            {/* Shared property details popup, used by both the offer table and the listings grid */}
            <PropertyModal property={activeModalProperty} onClose={() => setActiveModalProperty(null)} />

            <SubmitOfferModal
                open={Boolean(offerFor)}
                onClose={() => setOfferFor(null)}
                propertyId={offerFor?.id ?? ""}
                propertyTitle={offerFor?.title ?? ""}
                onSubmitted={() => {
                    setOfferFor(null);
                    reloadOffers();
                    setTab("offers");
                    toast.success("Offer submitted! Add your documents to get it verified faster.");
                }}
            />
        </div>
    );
}

// useSearchParams needs a Suspense boundary so the page can still be pre-rendered.
export default function PropertyDashboardPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                </div>
            }
        >
            <DashboardContent />
        </Suspense>
    );
}
