"use client";

import { CheckSquare, Download, Search, Square } from "lucide-react";
import { AdminButton } from "@/components/admin/ui/AdminButton";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { downloadParsedJson } from "@/lib/telegram/telegram-import";
import type {
    TelegramListingFilter,
    TelegramParsedProperty,
} from "@/types/telegram-import";
import { ListingRow } from "./ListingRow";

const PAGE_SIZE = 20;

interface ListingTableProps {
    properties: TelegramParsedProperty[];
    search: string;
    filter: TelegramListingFilter;
    page: number;
    selected: Set<string>;
    thumbnails: Record<string, string>;
    duplicateCodes: Set<string>;
    filtered: Array<{ property: TelegramParsedProperty; index: number; key: string }>;
    pageItems: Array<{ property: TelegramParsedProperty; index: number; key: string }>;
    allVisibleSelected: boolean;
    onSearchChange: (val: string) => void;
    onFilterChange: (val: TelegramListingFilter) => void;
    onPageChange: (updater: (prev: number) => number) => void;
    onSelectAllVisible: () => void;
    onDeselectVisible: () => void;
    onDeselectAll: () => void;
    onToggleSelect: (key: string) => void;
    onOpenReview: (index: number) => void;
    onImportSelected: (selectedItems: TelegramParsedProperty[]) => Promise<void>;
}

export function ListingTable({
    properties,
    search,
    filter,
    page,
    selected,
    thumbnails,
    duplicateCodes,
    filtered,
    pageItems,
    allVisibleSelected,
    onSearchChange,
    onFilterChange,
    onPageChange,
    onSelectAllVisible,
    onDeselectVisible,
    onDeselectAll,
    onToggleSelect,
    onOpenReview,
    onImportSelected,
}: ListingTableProps) {
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);

    return (
        <div className="space-y-6">
            {/* Filters & actions */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="flex flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 shrink-0 text-neutral-400" />
                    <FormInput
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by code, title or address"
                        className="mt-0 border-0 px-0 py-0 shadow-none focus:border-transparent"
                    />
                </div>
                <FormSelect
                    value={filter}
                    onChange={(e) => onFilterChange(e.target.value as TelegramListingFilter)}
                    className="mt-0 lg:w-56"
                >
                    <option value="all">All listings</option>
                    <option value="complete">Complete</option>
                    <option value="warnings">Has warnings</option>
                    <option value="missing-photos">Missing photos</option>
                    <option value="duplicates">Duplicate codes</option>
                </FormSelect>
                <AdminButton type="button" variant="secondary" onClick={() => downloadParsedJson(properties)}>
                    <Download className="h-4 w-4" />
                    Download Parsed JSON
                </AdminButton>
            </div>

            {/* Selection bar */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                <AdminButton type="button" variant="secondary" size="sm" onClick={onSelectAllVisible}>
                    <CheckSquare className="h-4 w-4" />
                    Select all visible
                </AdminButton>
                <AdminButton type="button" variant="ghost" size="sm" onClick={onDeselectAll}>
                    <Square className="h-4 w-4" />
                    Deselect all
                </AdminButton>
                <p className="text-sm font-bold text-neutral-600">
                    {selected.size} selected
                </p>
                <div className="ml-auto flex flex-col items-end gap-1">
                    <AdminButton
                        type="button"
                        disabled={selected.size === 0}
                        onClick={() => {
                            const selectedListings = Array.from(selected)
                                .map((key) => {
                                    // Extract numeric index whether key is "0", "key-0", or "item-0"
                                    const match = key.match(/\d+/);
                                    if (!match) return null;
                                    const index = parseInt(match[0], 10);
                                    return properties[index];
                                })
                                .filter((item): item is TelegramParsedProperty => Boolean(item));

                            if (selectedListings.length === 0) {
                                alert("Please select at least one listing from the checkbox selection.");
                                return;
                            }
                            onImportSelected(selectedListings);
                        }}
                    >
                        Import Selected ({selected.size}) to Supabase
                    </AdminButton>
                    <p className="max-w-sm text-right text-xs text-neutral-500">
                        Supabase import and permanent photo storage will be connected after the
                        parsed listings are reviewed.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold uppercase tracking-wide text-neutral-500">
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={allVisibleSelected}
                                        onChange={() =>
                                            allVisibleSelected ? onDeselectVisible() : onSelectAllVisible()
                                        }
                                        aria-label="Select all visible"
                                    />
                                </th>
                                <th className="px-4 py-3">Photo</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Address</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Beds / Baths</th>
                                <th className="px-4 py-3">Photos</th>
                                <th className="px-4 py-3">Warnings</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length === 0 ? (
                                <tr>
                                    <td colSpan={11} className="px-4 py-10 text-center text-neutral-500">
                                        No listings match the current filters.
                                    </td>
                                </tr>
                            ) : (
                                pageItems.map(({ property, index, key }) => (
                                    <ListingRow
                                        key={key}
                                        property={property}
                                        index={index}
                                        rowKey={key}
                                        isSelected={selected.has(key)}
                                        isDuplicate={duplicateCodes.has(property.telegramCode)}
                                        thumbnailUrl={thumbnails[key] ?? null}
                                        onToggleSelect={onToggleSelect}
                                        onOpenReview={onOpenReview}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 px-4 py-3">
                    <p className="text-sm text-neutral-500">
                        Showing {(currentPage - 1) * PAGE_SIZE + (pageItems.length ? 1 : 0)}–
                        {(currentPage - 1) * PAGE_SIZE + pageItems.length} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <AdminButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => onPageChange((p) => Math.max(1, p - 1))}
                        >
                            Previous
                        </AdminButton>
                        <span className="text-sm font-bold text-neutral-700">
                            Page {currentPage} / {totalPages}
                        </span>
                        <AdminButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => onPageChange((p) => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </AdminButton>
                    </div>
                </div>
            </div>
        </div>
    );
}