"use client";

import { AlertTriangle, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/ButtonProps";
import { formatPrice } from "@/lib/utils";
import type { TelegramParsedProperty } from "@/types/telegram-import";

interface ListingRowProps {
    property: TelegramParsedProperty;
    index: number;
    rowKey: string;
    isSelected: boolean;
    isDuplicate: boolean;
    thumbnailUrl: string | null;
    onToggleSelect: (key: string) => void;
    onOpenReview: (index: number) => void;
}

function ThumbnailCell({ url, code }: { url: string | null; code: string }) {
    if (!url) {
        return (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                <ImageIcon className="h-5 w-5" aria-hidden />
                <span className="sr-only">No photo for {code}</span>
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt={`Thumbnail for ${code}`}
            className="h-14 w-14 rounded-xl object-cover"
        />
    );
}

export function ListingRow({
    property,
    index,
    rowKey,
    isSelected,
    isDuplicate,
    thumbnailUrl,
    onToggleSelect,
    onOpenReview,
}: ListingRowProps) {
    return (
        <tr className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80">
            <td className="px-4 py-3">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(rowKey)}
                    aria-label={`Select ${property.telegramCode}`}
                />
            </td>
            <td className="px-4 py-3">
                <ThumbnailCell url={thumbnailUrl} code={property.telegramCode} />
            </td>
            <td className="px-4 py-3 font-bold text-neutral-900">
                {property.telegramCode}
                {isDuplicate ? (
                    <span className="ml-2 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                        Dup
                    </span>
                ) : null}
            </td>
            <td className="max-w-[12rem] truncate px-4 py-3 text-neutral-800">
                {property.title}
            </td>
            <td className="max-w-[14rem] truncate px-4 py-3 text-neutral-600">
                {property.address || "—"}
            </td>
            <td className="whitespace-nowrap px-4 py-3 font-bold text-neutral-900">
                {property.price != null ? formatPrice(property.price) : "—"}
            </td>
            <td className="px-4 py-3 text-neutral-700">{property.propertyType || "—"}</td>
            <td className="whitespace-nowrap px-4 py-3 text-neutral-700">
                {property.bedrooms ?? "—"} / {property.bathrooms ?? "—"}
            </td>
            <td className="px-4 py-3 text-neutral-700">{property.photoCount}</td>
            <td className="px-4 py-3">
                {property.warnings.length > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {property.warnings.length}
                    </span>
                ) : (
                    <span className="text-xs font-bold text-emerald-600">0</span>
                )}
            </td>
            <td className="px-4 py-3">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void onOpenReview(index)}
                >
                    Review
                </Button>
            </td>
        </tr>
    );
}