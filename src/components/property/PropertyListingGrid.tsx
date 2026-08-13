import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Property } from "@/types/property";

interface PropertyListingGridProps {
    properties: Property[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    /** e.g. "/properties/location/selangor/category/landed" — page param is appended as ?page=N */
    basePath: string;
    emptyMessage?: string;
}

export function PropertyListingGrid({
    properties,
    totalCount,
    totalPages,
    currentPage,
    basePath,
    emptyMessage = "No properties found in this area yet.",
}: PropertyListingGridProps) {
    if (properties.length === 0) {
        return (
            <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                <p className="text-lg font-semibold">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <>
            <p className="mt-1 text-sm text-neutral-600">
                Showing {properties.length} of {totalCount} available properties.
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-3">
                    {currentPage > 1 && (
                        <Link
                            href={`${basePath}?page=${currentPage - 1}`}
                            className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-neutral-50"
                        >
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </Link>
                    )}
                    <span className="text-sm font-semibold text-neutral-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    {currentPage < totalPages && (
                        <Link
                            href={`${basePath}?page=${currentPage + 1}`}
                            className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold shadow-sm hover:bg-neutral-50"
                        >
                            Next <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}