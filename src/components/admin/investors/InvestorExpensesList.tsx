"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { EXPENSE_CATEGORIES, formatDate, money } from "@/lib/investor";
import type { InvestorExpense } from "@/types/investor";

/** Expenses the investor submitted with receipts; their amounts are already in the property's costs. */
export function InvestorExpensesList({ propertyId }: { propertyId: string }) {
    const [expenses, setExpenses] = useState<InvestorExpense[] | null>(null);

    useEffect(() => {
        fetch(`/api/admin/investor-properties/${propertyId}/expenses`)
            .then((res) => res.json())
            .then((data) => setExpenses(data.expenses ?? []))
            .catch(() => setExpenses([]));
    }, [propertyId]);

    const label = (c: string) => EXPENSE_CATEGORIES.find((x) => x.key === c)?.label ?? c;

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-black">Expenses added by investor</h4>
            {expenses === null && <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />}
            {expenses?.length === 0 && <p className="text-sm text-neutral-500">No expenses submitted yet.</p>}
            {expenses?.map((x) => (
                <div key={x.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                    <div className="min-w-0">
                        <p className="text-sm font-bold">
                            {label(x.category)} · {money(x.amount)}
                        </p>
                        <p className="truncate text-xs text-neutral-500">
                            {formatDate(x.createdAt)}
                            {x.note ? ` · ${x.note}` : ""}
                            {x.receiptName ? ` · ${x.receiptName}` : ""}
                        </p>
                    </div>
                    {x.receiptUrl && (
                        <a
                            href={x.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold underline"
                        >
                            Receipt <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
}
