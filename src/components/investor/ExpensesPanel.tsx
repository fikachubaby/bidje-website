"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FileUp, Loader2 } from "lucide-react";
import { MoneyInput } from "@/components/admin/ui/MoneyInput";
import { Button } from "@/components/ui/ButtonProps";
import { EXPENSE_CATEGORIES, formatDate, money } from "@/lib/investor";
import type { ExpenseCategory, InvestorExpense, InvestorProperty } from "@/types/investor";
import { UPLOAD_ACCEPT, uploadFieldClass } from "./UploadWithRemark";

interface ExpensesPanelProps {
    propertyId: string;
    /** Admin uses the admin API; otherwise the signed-in investor's own API. */
    admin?: boolean;
    /** Called after an expense is added (investor API returns the updated property). */
    onAdded?: (property?: InvestorProperty) => void;
}

const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
const label = (c: ExpenseCategory) => EXPENSE_CATEGORIES.find((x) => x.key === c)?.label ?? c;

/** Add an expense (receipt + remark + amount + date) and list the ones recorded. Used by investor and admin. */
export function ExpensesPanel({ propertyId, admin = false, onAdded }: ExpensesPanelProps) {
    const listUrl = admin ? `/api/admin/investor-properties/${propertyId}/expenses` : `/api/investor/expenses?propertyId=${propertyId}`;
    const postUrl = admin ? `/api/admin/investor-properties/${propertyId}/expenses` : "/api/investor/expenses";

    const [category, setCategory] = useState<ExpenseCategory>("legal");
    const [amount, setAmount] = useState(0);
    const [note, setNote] = useState("");
    const [date, setDate] = useState(today);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [expenses, setExpenses] = useState<InvestorExpense[] | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await (await fetch(listUrl)).json();
            setExpenses(data.expenses ?? []);
        } catch {
            setExpenses([]);
        }
    }, [listUrl]);

    useEffect(() => {
        void load();
    }, [load]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        if (!receipt) return toast.error("Please attach the receipt");
        if (!(amount > 0)) return toast.error("Enter an amount above zero");
        setSaving(true);
        try {
            const form = new FormData();
            form.append("investorPropertyId", propertyId);
            form.append("category", category);
            form.append("amount", String(amount));
            form.append("note", note);
            form.append("expenseDate", date);
            form.append("receipt", receipt);
            const res = await fetch(postUrl, { method: "POST", body: form });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit");
            toast.success("Expense added");
            onAdded?.(data.property);
            setAmount(0);
            setNote("");
            setReceipt(null);
            setDate(today());
            await load();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to submit");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <form onSubmit={submit} className="space-y-3 rounded-2xl border border-neutral-200 p-4">
                <h3 className="text-sm font-black">Add an expense</h3>
                <div className="grid gap-2 sm:grid-cols-[1fr_220px]">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 px-4 py-3 text-sm font-bold hover:border-neutral-500">
                        <FileUp className="h-4 w-4 shrink-0" />
                        <span className="truncate">{receipt ? receipt.name : "Upload receipt"}</span>
                        <input type="file" accept={UPLOAD_ACCEPT} className="hidden" onChange={(e) => setReceipt(e.target.files?.[0] ?? null)} />
                    </label>
                    <input
                        className={uploadFieldClass}
                        placeholder="Remark (e.g. stamp duty)"
                        maxLength={300}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    <label className="block text-xs font-bold text-neutral-700">
                        Type
                        <select className={`${uploadFieldClass} mt-1`} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                            {EXPENSE_CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs font-bold text-neutral-700">
                        Amount (RM)
                        <MoneyInput className={`${uploadFieldClass} mt-1`} value={amount} onChange={setAmount} />
                    </label>
                    <label className="block text-xs font-bold text-neutral-700">
                        Date
                        <input type="date" className={`${uploadFieldClass} mt-1`} value={date} onChange={(e) => setDate(e.target.value)} />
                    </label>
                </div>
                <div className="flex justify-end">
                    <Button type="submit" size="sm" disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                        {saving ? "Submitting..." : "Submit expense"}
                    </Button>
                </div>
            </form>

            {expenses === null && <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />}
            {expenses?.length === 0 && <p className="text-sm text-neutral-500">No expenses recorded yet.</p>}
            {!!expenses?.length && (
                <ul className="space-y-2">
                    {expenses.map((x) => (
                        <li key={x.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold">
                                    {label(x.category)} · {money(x.amount)}
                                </p>
                                <p className="truncate text-xs text-neutral-500">
                                    {formatDate(x.expenseDate ?? x.createdAt)}
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
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
