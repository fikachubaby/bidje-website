"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Phone } from "lucide-react";
import { FormInput } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import { formatDate, phaseTimeframe } from "@/lib/investor";
import type {
    InvestorProperty,
    InvestorPropertyInput,
    MilestoneCategory,
} from "@/types/investor";
import { JOURNEY } from "./JourneyProgress";

type PhaseField = "legalStart" | "legalEnd" | "renovationStart" | "renovationEnd" | "salesStart" | "salesEnd";

export const PHASE_FIELDS: Record<MilestoneCategory, [PhaseField, PhaseField]> = {
    legal: ["legalStart", "legalEnd"],
    renovation: ["renovationStart", "renovationEnd"],
    sales: ["salesStart", "salesEnd"],
};

async function patchProperty(id: string, body: Partial<InvestorPropertyInput>): Promise<InvestorProperty> {
    const res = await fetch(`/api/investor/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save");
    return data.property;
}

type OnUpdated = (property: InvestorProperty) => void;

/** Renovation contractor name and phone, editable by the investor. */
export function ContractorCard({ property, onUpdated }: { property: InvestorProperty; onUpdated: OnUpdated }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(property.contractorName ?? "");
        setPhone(property.contractorPhone ?? "");
        setEditing(!property.contractorName && !property.contractorPhone);
    }, [property.id, property.contractorName, property.contractorPhone]);

    const save = async () => {
        setSaving(true);
        try {
            onUpdated(await patchProperty(property.id, { contractorName: name.trim(), contractorPhone: phone.trim() }));
            toast.success("Contractor saved");
            setEditing(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-neutral-200 p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase text-neutral-500">Contractor</p>
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Edit contractor">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            {editing ? (
                <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <FormInput label="Contractor name" value={name} onChange={(e) => setName(e.target.value)} />
                        <FormInput label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <Button size="sm" onClick={save} disabled={saving || (!name.trim() && !phone.trim())}>
                            {saving ? "Saving..." : "Save contractor"}
                        </Button>
                    </div>
                </div>
            ) : (
                <p>
                    🛠️ <b>{property.contractorName || "—"}</b>
                    {property.contractorPhone && (
                        <a href={`tel:${property.contractorPhone}`} className="ml-2 inline-flex items-center gap-1 text-neutral-600 underline">
                            <Phone className="h-3 w-3" /> {property.contractorPhone}
                        </a>
                    )}
                </p>
            )}
        </div>
    );
}

/** Planned start → end for legal, renovation and sales, editable by the investor. */
export function PhaseTimeframes({ property, onUpdated }: { property: InvestorProperty; onUpdated: OnUpdated }) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState<Partial<InvestorPropertyInput>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setEditing(false);
        setForm(
            Object.fromEntries(
                JOURNEY.flatMap((p) => PHASE_FIELDS[p.key].map((k) => [k, (property[k as keyof InvestorProperty] as string) ?? ""]))
            )
        );
    }, [property]);

    const save = async () => {
        setSaving(true);
        try {
            onUpdated(await patchProperty(property.id, form));
            toast.success("Timeframes saved");
            setEditing(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-neutral-200 p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase text-neutral-500">Phase timeframes</p>
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Edit timeframes">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            {editing ? (
                <div className="space-y-3">
                    {JOURNEY.map((p) => {
                        const [startKey, endKey] = PHASE_FIELDS[p.key];
                        return (
                            <div key={p.key} className="grid grid-cols-2 gap-3">
                                <FormInput
                                    label={`${p.label} start`}
                                    type="date"
                                    value={(form[startKey] as string) ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, [startKey]: e.target.value }))}
                                />
                                <FormInput
                                    label={`${p.label} end`}
                                    type="date"
                                    value={(form[endKey] as string) ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, [endKey]: e.target.value }))}
                                />
                            </div>
                        );
                    })}
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={save} disabled={saving}>
                            {saving ? "Saving..." : "Save timeframes"}
                        </Button>
                    </div>
                </div>
            ) : (
                <ul className="divide-y divide-neutral-100">
                    {JOURNEY.map((p) => {
                        const { start, end } = phaseTimeframe(property, p.key);
                        return (
                            <li key={p.key} className="flex justify-between gap-3 py-1.5">
                                <span>
                                    {p.icon} {p.label}
                                </span>
                                <span className="text-right font-semibold">
                                    {start || end ? `${formatDate(start)} → ${formatDate(end)}` : <span className="text-neutral-400">Not set</span>}
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
