import Link from "next/link";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams: Record<string, string | undefined>;
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams }: PaginationProps) {
    // Helper to generate query string with updated page parameter while retaining filters
    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams();

        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && key !== "page") {
                params.set(key, value);
            }
        });

        params.set("page", pageNumber.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    const getPageNumbers = () => {
        const pages: (number | "ellipsis")[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow + 2) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            if (start > 2) {
                pages.push("ellipsis");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push("ellipsis");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-1.5 sm:gap-2">
            {/* Previous Button */}
            {currentPage > 1 ? (
                <Link
                    href={createPageUrl(currentPage - 1)}
                    className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold shadow-sm hover:bg-neutral-50"
                >
                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
                </Link>
            ) : (
                <span className="flex items-center gap-1 rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2 text-sm font-bold text-neutral-300 cursor-not-allowed">
                    <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Prev</span>
                </span>
            )}

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => {
                if (page === "ellipsis") {
                    return (
                        <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-neutral-400">
                            <MoreHorizontal className="h-4 w-4" />
                        </span>
                    );
                }

                const isCurrent = page === currentPage;

                return (
                    <Link
                        key={page}
                        href={createPageUrl(page as number)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-colors ${isCurrent
                                ? "bg-black text-white shadow-sm"
                                : "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                            }`}
                    >
                        {page}
                    </Link>
                );
            })}

            {/* Next Button */}
            {currentPage < totalPages ? (
                <Link
                    href={createPageUrl(currentPage + 1)}
                    className="flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold shadow-sm hover:bg-neutral-50"
                >
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                </Link>
            ) : (
                <span className="flex items-center gap-1 rounded-xl border border-neutral-100 bg-neutral-50 px-3.5 py-2 text-sm font-bold text-neutral-300 cursor-not-allowed">
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="h-4 w-4" />
                </span>
            )}
        </nav>
    );
}