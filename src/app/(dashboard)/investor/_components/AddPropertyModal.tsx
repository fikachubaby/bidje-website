"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/ui/ButtonProps";
import {
    TransactionDetailsForm,
    toTransactionForm,
    type TransactionForm,
} from "@/components/investor/TransactionDetails";
import { money } from "@/lib/investor";
import type { InvestorProperty } from "@/types/investor";

interface PartnerChoice {
    id: string;
    name: string;
}

interface AddPropertyModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (property: InvestorProperty) => void;
}

/** Investor adds their own property using the same sections as the admin Transaction Details. */
export function AddPropertyModal({ open, onClose, onCreated }: AddPropertyModalProps) {
    const [form, setForm] = useState<TransactionForm>(() => toTransactionForm());
    const [saving, setSaving] = useState(false);
    const [legalFirms, setLegalFirms] = useState<PartnerChoice[]>([]);
    const [financingConsultants, setFinancingConsultants] = useState<PartnerChoice[]>([]);

    useEffect(() => {
        if (!open) return;
        setForm(toTransactionForm());
        // Bidje partners plus the ones this investor added themselves.
        fetch("/api/investor/partners")
            .then((res) => res.json())
            .then((data) => {
                setLegalFirms(data.legalFirms ?? []);
                setFinancingConsultants(data.financingConsultants ?? []);
            })
            .catch(() => toast.error("Failed to load legal firms and consultants"));
    }, [open]);

    if (!open) return null;

    const n = (v: unknown) => Number(v ?? 0);
    const cost = n(form.purchasePrice) + n(form.agentFee) + n(form.legalCost) + n(form.renovationCost) + n(form.otherCost);
    const price = n(form.sellingPrice) || n(form.targetPrice);
    const profit = price ? price - cost - n(form.sellingCost) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.address?.trim()) return toast.error("Please enter the property address");
        setSaving(true);
        try {
            // Internal notes are admin-only.
            const { notes: _notes, ...body } = form;
            void _notes;
            const res = await fetch("/api/investor/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (res.status === 401) {
                toast.error("Your session has expired. Please sign in again.");
                window.location.href = "/login?next=/investor";
                return;
            }
            if (!res.ok) throw new Error(data.error || "Failed to add property");
            toast.success("Property added");
            onCreated(data.property);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to add property");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal open onClose={onClose} wide title="Add property" description="Add an investment property to your portfolio.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <TransactionDetailsForm
                    form={form}
                    onChange={setForm}
                    legalFirms={legalFirms}
                    financingConsultants={financingConsultants}
                />

                <div className="flex items-center justify-between rounded-xl bg-neutral-950 p-4 text-white">
                    <span className="text-xs text-neutral-400">ESTIMATED NET PROFIT</span>
                    <span className="text-xl font-black text-brand">{price ? money(profit) : "Pending"}</span>
                </div>

                <div className="sticky bottom-0 -mx-1 flex justify-end gap-2 bg-white/90 px-1 py-3 backdrop-blur">
                    <Button type="button" variant="secondary" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                        {saving ? "Adding..." : "Add property"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
