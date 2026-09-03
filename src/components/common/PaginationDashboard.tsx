"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationDashboardProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    pageSizeOptions?: number[];
}

export function PaginationDashboard({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50, 100],
}: PaginationDashboardProps) {
    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-100 bg-white px-6 py-4 rounded-b-2xl">
            {/* Item Counter & Size Selection */}
            <div className="flex items-center gap-4 text-xs font-semibold text-neutral-500">
                <span>
                    Showing <strong className="text-neutral-900">{startItem}</strong> to{" "}
                    <strong className="text-neutral-900">{endItem}</strong> of{" "}
                    <strong className="text-neutral-900">{totalItems}</strong> entries
                </span>

                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 border-l border-neutral-200 pl-4">
                        <span>Per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-bold text-neutral-800 focus:outline-none"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Prev</span>
                </button>

                {/* Page Selector Dropdown */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700">
                    <span>Page</span>
                    <select
                        value={currentPage}
                        onChange={(e) => onPageChange(Number(e.target.value))}
                        className="rounded-lg border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-bold text-neutral-900 focus:outline-none"
                    >
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                    <span>of {totalPages || 1}</span>
                </div>

                {/* Next Button */}
                <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-700 shadow-sm transition hover:bg-neutral-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}