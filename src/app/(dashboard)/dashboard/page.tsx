"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, CreditCard, Loader2, ShieldCheck, User } from "lucide-react";

import { translate as t } from "@/lib/i18n/getTranslation";
import type { PropertyListing } from "@/types/property";

import { FeaturedListings, PropertyModal } from "../properties";
import { OfferHistoryTable, OfferSubmitForm, useOfferHistory } from "../offers";
import type { OfferHistoryItem } from "@/types/offer";
import { useDashboardUser } from "../useDashboardUser";

const subscription = {
    plan: "Subscriber Pass (Direct Owner Access)",
    price: "RM 2.00",
    billingCycle: "Monthly",
    status: "Active",
    autoExpiryDate: "2026-03-12",
};

export default function PropertyDashboardPage() {
    const { loading: userLoading, isMember, userId, userEmail, fullName } = useDashboardUser();
    const { offerHistory, submitOfferDocuments } = useOfferHistory(userId, isMember);

    const [activeModalProperty, setActiveModalProperty] = useState<PropertyListing | null>(null);
    const [selectedOfferId, setSelectedOfferId] = useState("");
    const [selectOfferError, setSelectOfferError] = useState<string | null>(null);

    function handleViewOfferDetails(offer: OfferHistoryItem) {
        if (offer.propertyData) setActiveModalProperty(offer.propertyData);
    }

    function handleSelectFeaturedListingForOffer(listing: PropertyListing) {
        const matchingOffer = offerHistory.find(
            (o) => o.propertyId === listing.id || o.propertyTitle === listing.title
        );
        if (matchingOffer) {
            setSelectedOfferId(matchingOffer.id);
            setSelectOfferError(null);
        } else {
            setSelectedOfferId("");
            setSelectOfferError("You don't have a pending offer for this property yet.");
        }
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }

    if (userLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 pb-12">
            {/* Header / Welcome Area */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-black">
                        {t("Subscribers.welcome")} {fullName || "Subscriber"}!
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">{t("Subscribers.title1")}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-sm">
                        <ShieldCheck className="h-4 w-4" />
                        {t("Subscribers.title2")}
                    </span>
                </div>
            </div>

            {/* Top Grid: Subscription Status & Profile Overview */}
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
                                    <p className="text-base font-bold text-black">
                                        {subscription.price} <span className="text-xs font-normal text-neutral-500">/mo</span>
                                    </p>
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

            {/* Offer History Log */}
            <OfferHistoryTable offerHistory={offerHistory} loading={false} onViewDetails={handleViewOfferDetails} />

            {/* Shared property details popup, used by both the offer table and the featured listings grid */}
            <PropertyModal property={activeModalProperty} onClose={() => setActiveModalProperty(null)} />

            {/* Document Upload Form */}
            <div>
                {selectOfferError && (
                    <p className="mb-3 text-xs font-medium text-red-600">{selectOfferError}</p>
                )}
                <OfferSubmitForm
                    userId={userId}
                    offerHistory={offerHistory}
                    selectedOfferId={selectedOfferId}
                    onSelectedOfferIdChange={setSelectedOfferId}
                    onSubmit={submitOfferDocuments}
                />
            </div>

            {/* Featured Property Listings */}
            <FeaturedListings
                isMember={isMember}
                onSelect={handleSelectFeaturedListingForOffer}
                actionLabel="Select Offer"
            />
        </div>
    );
}
