"use client";

import { StatCard } from "@/components/admin/ui/StatCard";

interface SummaryCardsProps {
    summary: {
        messages: number;
        groups: number;
        withPhotos: number;
        missingPrice: number;
        withWarnings: number;
        duplicates: number;
    };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Telegram messages" value={summary.messages} />
            <StatCard label="Property groups" value={summary.groups} />
            <StatCard label="Listings with photos" value={summary.withPhotos} />
            <StatCard label="Listings missing price" value={summary.missingPrice} />
            <StatCard label="Listings with warnings" value={summary.withWarnings} />
            <StatCard label="Duplicate property codes" value={summary.duplicates} />
        </div>
    );
}