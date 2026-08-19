"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToPropertiesButtonProps {
    searchString?: string;
}

export function BackToPropertiesButton({ searchString = "" }: BackToPropertiesButtonProps) {
    const backUrl = searchString ? `/properties?${searchString}` : "/properties";

    return (
        <Link
            href={backUrl}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm font-bold text-neutral-700 shadow-sm transition-all hover:bg-neutral-100 hover:text-black cursor-pointer"
        >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
        </Link>
    );
}