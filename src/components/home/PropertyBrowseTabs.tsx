"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    MapPin, BedDouble, Bath, Ruler, ArrowUpRight, ImageOff,
} from "lucide-react";
import type {
    DBProperty,
    DBPropertyImage,
    PropertyType,
} from "@/types/property";
import { PROPERTY_TYPES } from "@/types/property";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";

const DEFAULT_PAGE_SIZE = 9;
const PAGE_SIZE_OPTIONS = [9, 18, 27, 54];

export type RawBrowseProperty = Pick<
    DBProperty,
    | "id"
    | "title"
    | "asking_price"
    | "full_address"
    | "state"
    | "district"
    | "property_type"
    | "area_sqft"
    | "bedrooms"
    | "bathrooms"
    | "is_featured"
    | "urgent_sale"
    | "status"
    | "slug"
    | "bidje_score"
> & {
    property_images?: Pick<DBPropertyImage, "image_url" | "is_cover" | "display_order">[] | null;
};

type PropertyBrowseTabsProps = {
    properties?: RawBrowseProperty[];
    totalCount: number;
    page: number;
    pageSize: number;
    activeType: PropertyType | "All";
};

function formatPrice(price: number) {
    return `RM ${price.toLocaleString()}`;
}

function coverImageUrl(images?: RawBrowseProperty["property_images"]) {
    if (!images || images.length === 0) return null;
    const cover = images.find((img) => img.is_cover) ?? images[0];
    return cover?.image_url ?? null;
}

function NoImagePlaceholder() {
    return (
        <div className="flex h-44 w-full flex-col items-center justify-center gap-1.5 bg-neutral-100 text-neutral-400">
            <ImageOff className="h-6 w-6" />
            <span className="text-[11px] font-semibold uppercase tracking-wide">No Image Available</span>
        </div>
    );
}

export function PropertyBrowseTabs({
    properties = [],
    totalCount,
    page,
    pageSize,
    activeType,
}: PropertyBrowseTabsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Pagination state lives in the URL: /?type=Condo&page=2&size=18
    const go = (next: { type?: PropertyType | "All"; page?: number; size?: number }) => {
        const type = next.type ?? activeType;
        const nextPage = next.page ?? 1;
        const size = next.size ?? pageSize;

        const params = new URLSearchParams();
        if (type !== "All") params.set("type", type);
        if (nextPage > 1) params.set("page", String(nextPage));
        if (size !== DEFAULT_PAGE_SIZE) params.set("size", String(size));

        const qs = params.toString();
        startTransition(() => {
            router.push(qs ? `/?${qs}` : "/", { scroll: false });
        });
    };

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return (
        <section className="bg-white py-16 sm:py-24 border-b border-neutral-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-black sm:text-4xl">
                        Browse Properties
                    </h2>
                    <p className="mt-2 max-w-xl text-base text-neutral-600">
                        Explore listings by property type starting from RM100K.
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => go({ type: "All" })}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${activeType === "All"
                            ? "bg-[#ffd400] text-black"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                    >
                        All Types
                    </button>
                    {PROPERTY_TYPES.map((type) => (
                        <button
                            key={type}
                            onClick={() => go({ type })}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${activeType === type
                                ? "bg-[#ffd400] text-black"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Property Grid */}
                <div
                    className={`mt-10 grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${isPending ? "opacity-60" : "opacity-100"
                        }`}
                >
                    {properties.length === 0 && (
                        <p className="col-span-full text-center text-sm text-neutral-500">
                            No listings available in this category yet.
                        </p>
                    )}

                    {properties.map((property) => {
                        const imageUrl = coverImageUrl(property.property_images);
                        return (
                            <Link
                                key={property.id}
                                href={`/properties/${property.slug || property.id}`}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                            >
                                {imageUrl ? (
                                    <div
                                        className="h-44 w-full bg-neutral-100 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${imageUrl})` }}
                                    />
                                ) : (
                                    <NoImagePlaceholder />
                                )}
                                <div className="flex flex-1 flex-col p-4">
                                    <span className="text-lg font-extrabold text-black">
                                        {formatPrice(property.asking_price)}
                                    </span>
                                    <h3 className="mt-1 line-clamp-1 text-sm font-bold text-neutral-800">
                                        {property.title}
                                    </h3>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {property.district ? `${property.district}, ` : ""}{property.state}
                                    </div>
                                    <div className="mt-3 flex items-center gap-4 border-t border-neutral-100 pt-3 text-xs text-neutral-600">
                                        <span className="flex items-center gap-1">
                                            <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms ?? "-"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Bath className="h-3.5 w-3.5" /> {property.bathrooms ?? "-"}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Ruler className="h-3.5 w-3.5" /> {property.area_sqft ?? "-"} sqft
                                        </span>
                                        <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-black opacity-0 transition-opacity group-hover:opacity-100" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Pagination Controls */}
                {totalCount > 0 && (
                    <div className="mt-8 rounded-2xl border border-neutral-200 overflow-hidden">
                        <PaginationDashboard
                            currentPage={page}
                            totalPages={totalPages}
                            totalItems={totalCount}
                            pageSize={pageSize}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                            onPageChange={(p) => go({ page: p })}
                            onPageSizeChange={(size) => go({ size })}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
