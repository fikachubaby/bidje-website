import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { getPropertyById } from "@/lib/properties/properties";

interface PropertyDetailPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        return {
            title: "Property Not Found | Bidje",
        };
    }

    const title = `${property.title} | For Sale in ${property.location}`;
    const description = property.description
        ? property.description.slice(0, 160)
        : `Check out ${property.title} located in ${property.location}. Price: ${formatPrice(property.price, property.currency)}.`;

    const images = property.images && property.images.length > 0
        ? property.images
        : [property.imageUrl || "/placeholder-property.jpg"];

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

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        notFound();
    }

    const images = property.images && property.images.length > 0
        ? property.images
        : [property.imageUrl || "/placeholder-property.jpg"];

    const bidjeScore = property.bidjeScore ?? 85;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateListing",
        "name": property.title,
        "description": property.description,
        "url": `https://bidje.com/properties/${property.id}`,
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

    return (
        <main className="min-h-screen bg-neutral-50 text-black">
            {/* Inject JSON-LD Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

                {/* Back Link & Breadcrumb Navigation */}
                <nav className="mb-6 flex items-center justify-between">
                    <Link
                        href="/properties"
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-100 hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Properties
                    </Link>

                    <div className="hidden items-center gap-2 text-xs font-semibold text-neutral-500 sm:flex">
                        <Link href="/" className="hover:underline">Home</Link>
                        <ChevronRight className="h-3 w-3 text-neutral-400" />
                        <Link href="/properties" className="hover:underline">Properties</Link>
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
                                    Urgent Sale
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
                            <p className="text-xs font-semibold text-neutral-500">Asking Price</p>
                            <p className="text-3xl font-black text-black">
                                {formatPrice(property.price, property.currency)}
                            </p>
                        </div>
                        <FavouriteButton propertyId={property.id} className="border border-neutral-200 shadow-sm" />
                    </div>
                </div>

                {/* Media Gallery Grid */}
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-200 md:col-span-3 md:aspect-[16/9]">
                        <Image
                            src={images[0]}
                            alt={property.title}
                            fill
                            priority
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 75vw"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
                        {images.slice(1, 3).map((img, idx) => (
                            <div key={idx} className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-neutral-200">
                                <Image
                                    src={img}
                                    alt={`${property.title} preview ${idx + 2}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                />
                            </div>
                        ))}
                        {images.length < 2 && (
                            <div className="flex aspect-[16/10] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-100 p-4 text-center text-xs font-medium text-neutral-500">
                                Additional photos coming soon
                            </div>
                        )}
                    </div>
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
                                    <p className="text-xs text-neutral-500">Bedrooms</p>
                                    <p className="text-base font-bold">{property.bedrooms ?? "-"} Beds</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <Bath className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Bathrooms</p>
                                    <p className="text-base font-bold">{property.bathrooms ?? "-"} Baths</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <Maximize2 className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Built-Up Size</p>
                                    <p className="text-base font-bold">{property.areaSqft ? `${property.areaSqft} sqft` : "-"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-neutral-100 p-3">
                                    <ShieldCheck className="h-5 w-5 text-neutral-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-neutral-500">Tenure</p>
                                    <p className="text-base font-bold">{property.tenure || "Freehold"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-lg font-bold">Property Overview</h2>
                            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                                {property.description || "No description provided for this listing."}
                            </p>
                        </div>

                        {/* Additional Specifications */}
                        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                            <h2 className="text-lg font-bold">Key Specifications</h2>
                            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">Property Type</dt>
                                    <dd className="font-semibold">{property.category}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">Bumi Status</dt>
                                    <dd className="font-semibold">{property.bumiStatus || "Non-Bumi"}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">Land Size</dt>
                                    <dd className="font-semibold">{property.landSize || "N/A"}</dd>
                                </div>
                                <div className="flex justify-between border-b border-neutral-100 py-2">
                                    <dt className="text-neutral-500">Verified Offers</dt>
                                    <dd className="font-semibold">{property.verifiedOfferCount ?? 0} active</dd>
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
                                <p className="mt-1 text-2xl font-black">Make an Offer</p>
                                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                                    Submit a formal offer directly to the seller. Offers are verified and reviewed promptly.
                                </p>

                                <Link
                                    href={`/properties/${property.id}/make-offer`}
                                    className="mt-5 block w-full rounded-xl border-2 border-black bg-[#ffd400] py-3.5 text-center text-sm font-black shadow-[3px_3px_0_0_#000] transition hover:-translate-y-0.5 hover:bg-[#ffe24b]"
                                >
                                    Make Offer Now
                                </Link>

                                <p className="mt-3 text-center text-[11px] font-semibold text-neutral-500">
                                    RM500 commitment fee applies upon offer submission
                                </p>
                            </div>

                            {/* Investment Rating Widget */}
                            <BidjeRatingCard score={bidjeScore} />

                            {/* Estimated Market Valuation Card */}
                            {(property.marketValue || property.maxLoanApplicable) && (
                                <div className="rounded-2xl border border-neutral-200 bg-white p-6">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-neutral-700" />
                                        <h3 className="font-bold text-black">Financial Insights</h3>
                                    </div>

                                    <div className="mt-4 space-y-3 text-sm">
                                        {property.marketValue && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">Est. Market Value</span>
                                                <span className="font-bold">{formatPrice(property.marketValue)}</span>
                                            </div>
                                        )}
                                        {property.maxLoanApplicable && (
                                            <div className="flex justify-between">
                                                <span className="text-neutral-500">Max Loan Eligibility</span>
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