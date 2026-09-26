"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import { REMINDER_DAY_PRESETS } from "@/lib/reminders";
import type {
    ReminderChannel,
    ReminderFormInput,
    ReminderOfferOption,
    ReminderPropertyOption
} from "@/types/reminder";

interface Investor {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
}

interface AddReminderModalProps {
    properties: ReminderPropertyOption[];
    offers?: ReminderOfferOption[];
    defaultPropertyId?: string;
    defaultOfferId?: string;
    onClose: () => void;
    onSubmit: (input: ReminderFormInput) => Promise<void>;
}

export function AddReminderModal({
    properties,
    offers = [],
    defaultPropertyId,
    defaultOfferId,
    onClose,
    onSubmit,
}: AddReminderModalProps) {
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [propertyId, setPropertyId] = useState(defaultPropertyId ?? "");
    const [offerId, setOfferId] = useState(defaultOfferId ?? "");
    const [investorId, setInvestorId] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [channel, setChannel] = useState<ReminderChannel>("both");
    const [selectedDays, setSelectedDays] = useState<number[]>([7, 3, 0]);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetch("/api/investors")
            .then((res) => res.json())
            .then((data) => setInvestors(data.investors ?? []))
            .catch((err) => console.error("Failed to load investors:", err));
    }, []);

    const toggleDay = (day: number) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => b - a)
        );
    };

    const handleSubmit = async () => {
        setErrorMsg("");
        if (!propertyId || !investorId || !title || !dueDate) {
            setErrorMsg("Please fill in property, investor, title, and due date.");
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                propertyId,
                investorId,
                offerId: offerId || undefined,
                title,
                description: description || undefined,
                dueDate,
                channel,
                remindDaysBefore: selectedDays.length ? selectedDays : [0],
            });
            onClose();
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to create reminder. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-black text-neutral-900">Add Reminder</h2>
                    <button onClick={onClose} className="admin-action-btn" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <FormSelect
                        label="Property"
                        value={propertyId}
                        onChange={(e) => setPropertyId(e.target.value)}
                    >
                        <option value="">Select property</option>
                        {properties.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </FormSelect>

                    {offers.length > 0 && (
                        <FormSelect
                            label="Linked offer (optional)"
                            value={offerId}
                            onChange={(e) => setOfferId(e.target.value)}
                        >
                            <option value="">No linked offer</option>
                            {offers
                                .filter((o) => o.propertyId === propertyId)
                                .map((o) => (
                                    <option key={o.id} value={o.id}>
                                        {o.buyerName} — {o.status}
                                    </option>
                                ))}
                        </FormSelect>
                    )}

                    <FormSelect
                        label="Investor to notify"
                        value={investorId}
                        onChange={(e) => setInvestorId(e.target.value)}
                    >
                        <option value="">Select investor</option>
                        {investors.map((inv) => (
                            <option key={inv.id} value={inv.id}>
                                {inv.full_name ?? inv.email}
                            </option>
                        ))}
                    </FormSelect>

                    <FormInput
                        label="Reminder title"
                        placeholder="e.g. Lawyer follow-up on SPA signing"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <FormTextarea
                        label="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />

                    <FormInput
                        label="Due date"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                    />

                    <FormSelect
                        label="Notify via"
                        value={channel}
                        onChange={(e) => setChannel(e.target.value as ReminderChannel)}
                    >
                        <option value="both">WhatsApp + Email</option>
                        <option value="whatsapp">WhatsApp only</option>
                        <option value="email">Email only</option>
                    </FormSelect>

                    <div>
                        <span className="block text-sm font-bold text-neutral-800">Send reminders</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {REMINDER_DAY_PRESETS.map((preset) => (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() => toggleDay(preset.value)}
                                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${selectedDays.includes(preset.value)
                                            ? "border-black bg-black text-white"
                                            : "border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400"
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {errorMsg && <p className="text-xs font-semibold text-red-600">{errorMsg}</p>}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? "Creating..." : "Create Reminder"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}