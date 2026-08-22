"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Lock, MapPin, X } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";

interface AddressGateProps {
    fullAddress?: string;
    googleMapsUrl?: string;
    isSubscriber?: boolean;
}

export function UnlockAddressModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-neutral-400 hover:bg-neutral-100 hover:text-black"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fffbea] border border-neutral-200">
                    <Lock className="h-7 w-7 text-black" />
                </div>

                <div className="mt-4 text-center">
                    <h3 className="text-xl font-black text-black">Unlock Full Address</h3>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                        Full address and precise location details are available to subscribers only.
                    </p>

                    <div className="mt-5 rounded-2xl bg-[#fffbea] p-4 border border-[#ffe066]">
                        <p className="text-xs font-bold text-neutral-800">
                            Get unlimited access with our <br />
                            <span className="text-sm font-black text-black">RM 2/month</span> subscription.
                        </p>
                    </div>

                    <Link
                        href="/subscribe"
                        className="mt-5 block w-full rounded-xl border-2 border-black bg-[#ffd400] py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
                    >
                        Subscribe Now
                    </Link>

                    <p className="mt-4 text-xs font-semibold text-neutral-500">
                        Already a subscriber?{" "}
                        <Link href="/sign-in" className="text-black underline font-bold">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export function PropertyAddressCard({
    fullAddress,
    isSubscriber: overrideSubscriber,
}: {
    fullAddress?: string;
    isSubscriber?: boolean;
}) {
    const { isSubscriber: sessionSubscriber, loading } = useSession();
    const isSubscriber = overrideSubscriber ?? sessionSubscriber;
    const [showModal, setShowModal] = useState(false);
    const displayAddress = fullAddress || "Address details unavailable";

    return (
        <>
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                        <div className="rounded-xl bg-[#fffbea] p-3 text-black border border-neutral-200">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                                Full Address
                            </p>

                            {loading && overrideSubscriber === undefined ? (
                                <div className="mt-2 h-5 w-48 animate-pulse rounded bg-neutral-200" />
                            ) : isSubscriber ? (
                                <p className="mt-1 text-base font-bold text-black">{displayAddress}</p>
                            ) : (
                                <div
                                    className="relative mt-1 cursor-pointer group opacity-80"
                                    onClick={() => setShowModal(true)}
                                >
                                    <p className="select-none text-base font-bold text-neutral-800 blur-xs transition-all group-hover:blur-[5px]">
                                        {displayAddress}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-neutral-600">
                                        <Lock className="h-3.5 w-3.5" />
                                        Subscribe to unlock full address
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {!loading && !isSubscriber && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-full border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-100 hover:text-black transition"
                            title="Unlock full address"
                        >
                            <Eye className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            <UnlockAddressModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}

export function LocationMapCard({
    fullAddress,
    googleMapsUrl,
    isSubscriber: overrideSubscriber,
}: AddressGateProps) {
    const { isSubscriber: sessionSubscriber, loading } = useSession();
    const isSubscriber = overrideSubscriber ?? sessionSubscriber;
    const [showModal, setShowModal] = useState(false);

    // External link target when user clicks "Open in Google Maps"
    const externalMapsUrl =
        googleMapsUrl ||
        (fullAddress
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
            : "#");

    let queryLocation = "";
    if (googleMapsUrl && googleMapsUrl.includes("q=")) {
        try {
            const urlObj = new URL(googleMapsUrl);
            queryLocation = urlObj.searchParams.get("q") || "";
        } catch {
            queryLocation = "";
        }
    }

    const embedQuery = queryLocation || fullAddress || "Malaysia";
    const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(embedQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

    return (
        <>
            <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h3 className="font-bold text-black text-lg">Location Map</h3>
                <p className="mt-0.5 text-xs text-neutral-500">View exact location and get directions</p>

                <div className="relative mt-4 h-48 w-full overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
                    <iframe
                        title="Property Location Map"
                        src={mapEmbedSrc}
                        className={`h-full w-full border-0 transition-all duration-300 ${!isSubscriber && !loading ? "pointer-events-none blur-sm opacity-70 select-none" : ""
                            }`}
                        loading="lazy"
                        allowFullScreen
                    />

                    {/* Non-subscriber blur overlay */}
                    {!isSubscriber && !loading && (
                        <div
                            onClick={() => setShowModal(true)}
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 cursor-pointer p-4 text-center transition hover:bg-black/20"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md">
                                <Lock className="h-5 w-5 text-black" />
                            </div>
                            <span className="mt-2 rounded-lg bg-black/80 px-3 py-1 text-xs font-bold text-white shadow">
                                Subscribe to view map
                            </span>
                        </div>
                    )}
                </div>

                {loading && overrideSubscriber === undefined ? (
                    <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-neutral-200" />
                ) : isSubscriber ? (
                    <a
                        href={externalMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ffd400] py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
                    >
                        <MapPin className="h-4 w-4" />
                        Open in Google Maps
                    </a>
                ) : (
                    <button
                        onClick={() => setShowModal(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ffd400] py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
                    >
                        <MapPin className="h-4 w-4" />
                        Open in Google Maps
                    </button>
                )}
            </div>

            <UnlockAddressModal isOpen={showModal} onClose={() => setShowModal(false)} />
        </>
    );
}