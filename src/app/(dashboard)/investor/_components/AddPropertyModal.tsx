"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/admin/ui/Modal";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { MoneyInput } from "@/components/admin/ui/MoneyInput";
import { Button } from "@/components/ui/ButtonProps";
import { money, STAGE_LABELS } from "@/lib/investor";
import type { InvestorProperty, InvestorPropertyInput, InvestorStage } from "@/types/investor";

type Form = Omit<Partial<InvestorPropertyInput>, "investorId">;

// Same money rows as the property detail's Money tab.
const MONEY_FIELDS: { key: keyof Form; label: string }[] = [
    { key: "purchasePrice", label: "Purchase price (RM)" },
    { key: "legalCost", label: "Legal cost (RM)" },
    { key: "renovationCost", label: "Renovation (RM)" },
    { key: "otherCost", label: "Other expenses (RM)" },
    { key: "sellingCost", label: "Estimated selling cost (RM)" },
    { key: "targetPrice", label: "Target sale price (RM)" },
    { key: "highestOffer", label: "Highest offer so far (RM)" },
];

const EMPTY: Form = {
    refNo: "",
    address: "",
    state: "",
    dateSigned: "",
    expectedCompletion: "",
    stage: "legal",
    purchasePrice: 0,
    legalCost: 0,
    renovationCost: 0,
    otherCost: 0,
    sellingCost: 0,
    targetPrice: 0,
    highestOffer: 0,
};

interface AddPropertyModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: (property: InvestorProperty) => void;
}

export function AddPropertyModal({ open, onClose, onCreated }: AddPropertyModalProps) {
    const [form, setForm] = useState<Form>(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) setForm(EMPTY);
    }, [open]);

    if (!open) return null;

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((prev) => ({ ...prev, [key]: value }));

    const cost =
        Number(form.purchasePrice) + Number(form.legalCost) + Number(form.renovationCost) + Number(form.otherCost);
    const profit = form.targetPrice ? Number(form.targetPrice) - cost - Number(form.sellingCost) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.address?.trim()) return toast.error("Please enter the property address");
        setSaving(true);
        try {
            const res = await fetch("/api/investor/portfolio", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
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
            <form onSubmit={handleSubmit} className="space-y-6">
                <section className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <FormInput
                            label="Address *"
                            required
                            value={form.address ?? ""}
                            onChange={(e) => set("address", e.target.value)}
                        />
                    </div>
                    <FormInput label="State" value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} />
                    <FormInput label="Ref no." value={form.refNo ?? ""} onChange={(e) => set("refNo", e.target.value)} />
                    <FormSelect label="Current stage" value={form.stage} onChange={(e) => set("stage", e.target.value as InvestorStage)}>
                        {Object.entries(STAGE_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </FormSelect>
                    <FormInput
                        label="Date signed"
                        type="date"
                        value={form.dateSigned ?? ""}
                        onChange={(e) => set("dateSigned", e.target.value)}
                    />
                    <FormInput
                        label="Expected completion"
                        type="date"
                        value={form.expectedCompletion ?? ""}
                        onChange={(e) => set("expectedCompletion", e.target.value)}
                    />
                </section>

                <section>
                    <h3 className="mb-3 text-sm font-black">Money</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {MONEY_FIELDS.map(({ key, label }) => (
                            <MoneyInput key={key} label={label} value={Number(form[key] ?? 0)} onChange={(v) => set(key, v as never)} />
                        ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-950 p-4 text-white">
                        <span className="text-xs text-neutral-400">ESTIMATED NET PROFIT</span>
                        <span className="text-xl font-black text-brand">{form.targetPrice ? money(profit) : "Pending"}</span>
                    </div>
                </section>

                <div className="flex justify-end gap-2">
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
