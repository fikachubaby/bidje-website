"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PaginationDashboard } from "@/components/common/PaginationDashboard";

interface PropertiesPagePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

export function PropertiesPagePagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
}: PropertiesPagePaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/properties?${params.toString()}`);
    };

    return (
        <div className="mt-8 rounded-2xl border border-neutral-200 overflow-hidden">
            <PaginationDashboard
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
            />
        </div>
    );
}