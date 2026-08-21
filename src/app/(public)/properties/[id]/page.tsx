import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import {
    BedDouble,
    Bath,
    Maximize2,
    MapPin,
    ShieldCheck,
    TrendingUp,
    ArrowLeft,
    ChevronRight
} from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { BidjeRatingCard } from "@/components/property/BidjeRatingCard";
import { FavouriteButton } from "@/components/property/FavouriteButton";
import { formatPrice } from "@/lib/utils";
import { getPropertyByIdOrSlug } from "@/lib/properties/property-service";
import { translate as t } from "@/lib/i18n/getTranslation";
import { PropertyGallery } from "@/components/property/PropertyGallery";
import { DEFAULT_PROPERTY_IMAGE } from "@/app/(dashboard)/properties/utils";

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
    const { id: identifier } = await params;
    const property = await getPropertyByIdOrSlug(identifier);

    if (!property) {
        return {
            title: "Property Not Found | Bidje",
        };
    }

    const title = `${property.title} | For Sale in ${property.location}`;
    const description = property.description
        ? property.description.slice(0, 160)
        : `Check out ${property.title} located in ${property.location}. Price: ${formatPrice(property.price, property.currency)}.`;

    const hasImages = property.images && property.images.length > 0;
    const images = hasImages
        ? property.images!
        : [property.imageUrl && property.imageUrl.trim() !== "" ? property.imageUrl : DEFAULT_PROPERTY_IMAGE];

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "article",
            images: images.map((url) => ({ url })),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [images[0]],
        },
    };
}

export default async function PropertyDetailPage({ params, searchParams }: PropertyDetailPageProps) {
    const { id: identifier } = await params;
    const resolvedSearchParams = await searchParams;
    const property = await getPropertyByIdOrSlug(identifier);

    console.log("DEBUG PROPERTY FETCH:", {
        identifierFromURL: identifier,
        fetchedSlug: property?.slug,
        fetchedId: property?.id
    });

    if (!property) {
        notFound();
    }

    const paramsObj = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((v) => v !== undefined && paramsObj.append(key, v));
        } else if (value !== undefined) {
            paramsObj.set(key, value);
        }
    });
    const searchString = paramsObj.toString();

    // Permanent SEO Redirect if accessed via raw UUID
    if (property.slug && identifier === property.id) {
        const targetUrl = searchString
            ? `/properties/${property.slug}?${searchString}`
            : `/properties/${property.slug}`;
        redirect(targetUrl);
    }

    const backUrl = searchString ? `/properties?${searchString}` : "/properties";

    const hasValidImages = property.images && property.images.length > 0;
    const rawImages = hasValidImages
        ? property.images!
        : [property.imageUrl && property.imageUrl.trim() !== "" ? property.imageUrl : DEFAULT_PROPERTY_IMAGE];

    const images = rawImages.slice(0, 15);
    const bidjeScore = property.bidjeScore ?? 85;

    // Use slug for Schema URL to maximize SEO impact
    const canonicalIdentifier = property.slug || property.id;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description,
        "url": `https://www.bidje.com/properties/${canonicalIdentifier}`,
        "datePosted": property.createdAt,
        "price": property.price,
        "priceCurrency": property.currency || "MYR",
        "mainEntity": {
            "@type": "SingleFamilyResidence",
            "name": property.title,
            "description": property.description,
            "image": images,
            "address": {
                "@type": "PostalAddress",
                "addressLocality": property.location,
                "addressCountry": "MY"
            },
            "floorSize": property.areaSqft ? {
                "@type": "QuantitativeValue",
                "value": property.areaSqft,
                "unitCode": "FTK"
            } : undefined,
            "numberOfRooms": property.bedrooms,
            "numberOfBathroomsTotal": property.bathrooms,
            "offers": {
                "@type": "Offer",
                "price": property.price,
                "priceCurrency": property.currency || "MYR",
                "availability": "https://schema.org/InStock",
                "validFrom": property.createdAt
            }
        }
    };

    // Make Offer URL utilizing the canonical identifier
    const makeOfferRoute = searchString
        ? `/properties/${canonicalIdentifier}/make-offer?${searchString}`
        : `/properties/${canonicalIdentifier}/make-offer`;

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Back Link & Breadcrumb Navigation */}
                <nav className="mb-6 flex items-center justify-between">
                    <Link
                        href={backUrl}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-100 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t("Properties.backtoProperty")}
                    </Link>

                    <div className="hidden items-center gap-2 text-xs font-semibold text-neutral-500 sm:flex">
                        <Link href="/" className="hover:underline">{t("Main.menu.menu4")}</Link>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                        <Link href={backUrl} className="hover:underline">{t("Main.menu.menu5")}</Link>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                        <span className="max-w-[200px] truncate text-black">{property.title}</span>
                    </div>
                </nav>

                {/* Header Info */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-[#ffd400] px-3 py-1 text-xs font-black uppercase tracking-wide">
                                {property.category || "Featured"}
                            </span>
                            {property.urgentSale && (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
                                    {t("Main.subHeading.subH1")}
                                </span>
                            )}
                        </div>
                        <h1 className="mt-2 text-3xl font-black sm:text-4xl">{property.title}</h1>
                        <p className="mt-1 flex items-center gap-1 text-sm font-medium text-neutral-600">
                            <MapPin className="h-4 w-4 shrink-0 text-neutral-400" />
                            {property.location}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                        <div>
                            <p className="text-xs font-semibold text-neutral-500">{t("Main.subHeading.subH2")}</p>
                            <p className="text-3xl font-black text-black">
                                {formatPrice(property.price, property.currency)}
                            </p>
                        </div>
                        <FavouriteButton propertyId={property.id} className="border border-neutral-200 shadow-sm" />
                    </div>
                </div>

                {/* Media Gallery Grid */}
                <div className="mt-6">
                    <PropertyGallery images={images} title={property.title} />
                </div>

                {/* Main Content Layout */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column: Details & Overview */}
                    <div className="space-y-8 lg:col-span-2">

                        {/* Highlights Grid */}
                        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <BedDouble className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">{t("Properties.fields.bedrooms")}</p>
                                    <p className="text-base font-bold">{property.bedrooms ?? "-"} {t("Properties.fields.beds")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <Bath className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">{t("Properties.fields.bathrooms")}</p>
                                    <p className="text-base font-bold">{property.bathrooms ?? "-"} {t("Properties.fields.baths")}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <Maximize2 className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">{t("Properties.fields.buildSize")}</p>
                                    <p className="text-base font-bold">{property.areaSqft ? `${property.areaSqft} sqft` : "-"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <ShieldCheck className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">{t("Properties.fields.tenure")}</p>
                                    <p className="text-base font-bold">{property.tenure || "Freehold"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-lg font-bold">{t("Properties.overview")}</h2>
                            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                                {property.description || "No description provided for this listing."}
                            </p>
                        </div>

                        {/* Additional Specifications */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-lg font-bold">{t("Properties.keySpecs")}</h2>
                            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">{t("Properties.propertyType")}</dt>
                                    <dd className="font-semibold">{property.category}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">{t("Properties.bumiStatus")}</dt>
                                    <dd className="font-semibold">{property.bumiStatus || "Non-Bumi"}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">{t("Properties.fields.landSize")}</dt>
                                    <dd className="font-semibold">{property.landSize || "N/A"}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">{t("SubmitOfferModal.verifyOffer")}</dt>
                                    <dd className="font-semibold">{property.verifiedOfferCount ?? 0} {t("Main.status.active")}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Right Column: Investment Analysis & Action Sticky Card */}
                    <div className="space-y-6">
                        <div className="sticky top-6 space-y-6">

                            {/* Make Offer Call-to-Action Box */}
                            <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000]">
                                <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Ready to buy?</p>
                                <p className="mt-1 text-2xl font-black">{t("Main.subHeading.subH4")}</p>
                                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                                    {t("Main.subHeading.subH5")}
                                </p>

                                <Link
                                    href={makeOfferRoute}
                                    className="mt-5 block w-full rounded-xl border-2 border-black bg-[#ffd400] py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
                                >
                                    {t("Main.subHeading.subH6")}
                                </Link>

                                <p className="mt-3 text-center text-[11px] font-semibold text-neutral-500">
                                    {t("Main.subHeading.subH7")}
                                </p>
                            </div>

                            {/* Investment Rating Widget */}
                            <BidjeRatingCard score={bidjeScore} />

                            {/* Estimated Market Valuation Card */}
                            {(property.marketValue || property.maxLoanApplicable) && (
                                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-neutral-700" />
                                        <h3 className="font-bold text-black">{t("Main.subHeading.subH8")}</h3>
                                    </div>

                                    <div className="mt-4 space-y-3 text-sm">
                                        {property.marketValue && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">{t("Main.subHeading.subH9")}</span>
                                                <span className="font-bold">{formatPrice(property.marketValue)}</span>
                                            </div>
                                        )}
                                        {property.maxLoanApplicable && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">{t("Main.subHeading.subH10")}</span>
                                                <span className="font-bold">{formatPrice(property.maxLoanApplicable)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}