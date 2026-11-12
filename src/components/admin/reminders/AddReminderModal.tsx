"use client";

import { useEffect, useState } from "react";
import { Bell, CalendarDays, Users, X } from "lucide-react";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import { cn } from "@/lib/utils";
import { MAX_REMINDER_RECIPIENTS, REMINDER_REPEAT_OPTIONS } from "@/lib/reminders";
import type { PropertyContact } from "@/lib/investor";
import type {
    ReminderChannel,
    ReminderFormInput,
    ReminderOfferOption,
    ReminderPropertyOption,
    ReminderRecipient,
    ReminderRepeat,
} from "@/types/reminder";

const EMPTY_RECIPIENT: ReminderRecipient = { role: "", name: "", phone: "", email: "" };
/** Roles that can be typed in by hand (beyond the saved property contacts). */
const MANUAL_ROLES = ["Admin", "Lawyer", "Contractor", "Other"];
const inputClass =
    "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 hover:border-neutral-500 focus:border-black";

function SectionCard({ icon: Icon, title, required, children }: { icon: typeof Bell; title: string; required?: boolean; children: React.ReactNode }) {
    return (
        <section className="overflow-hidden rounded-2xl border border-neutral-200">
            <header className="flex items-center gap-2 bg-brand-muted/50 px-4 py-2.5">
                <Icon className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-black text-neutral-900">
                    {title}
                    {required && <span className="text-red-500"> *</span>}
                </h3>
            </header>
            <div className="p-4">{children}</div>
        </section>
    );
}

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
    /** When set, the reminder targets this investor property and the property/investor pickers are hidden. */
    investorProperty?: { id: string; investorId: string; address: string; contacts?: PropertyContact[] };
    onClose: () => void;
    onSubmit: (input: ReminderFormInput) => Promise<void>;
}

export function AddReminderModal({
    properties,
    offers = [],
    defaultPropertyId,
    defaultOfferId,
    investorProperty,
    onClose,
    onSubmit,
}: AddReminderModalProps) {
    const [investors, setInvestors] = useState<Investor[]>([]);
    const [propertyId, setPropertyId] = useState(defaultPropertyId ?? "");
    const [offerId, setOfferId] = useState(defaultOfferId ?? "");
    const [investorId, setInvestorId] = useState(investorProperty?.investorId ?? "");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [channel, setChannel] = useState<ReminderChannel>("both");
    const [repeatEvery, setRepeatEvery] = useState<ReminderRepeat>("week");
    const [recipients, setRecipients] = useState<ReminderRecipient[]>(() =>
        Array.from({ length: MAX_REMINDER_RECIPIENTS }, () => ({ ...EMPTY_RECIPIENT }))
    );
    const contacts = investorProperty?.contacts ?? [];
    const [sendNow, setSendNow] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        fetch("/api/investors")
            .then((res) => res.json())
            .then((data) => setInvestors(data.investors ?? []))
            .catch((err) => console.error("Failed to load investors:", err));
    }, []);

    const updateRecipient = (i: number, patch: Partial<ReminderRecipient>) =>
        setRecipients((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

    /** Picking a saved contact fills in their details; a manual role keeps whatever was typed. */
    const pickRole = (i: number, value: string) => {
        const contact = contacts.find((c) => `saved:${c.role}` === value);
        if (contact) updateRecipient(i, { role: contact.role, name: contact.name, phone: contact.phone ?? "", email: contact.email ?? "" });
        else if (!value) updateRecipient(i, { ...EMPTY_RECIPIENT });
        else updateRecipient(i, { role: value });
    };

    const handleSubmit = async () => {
        setErrorMsg("");
        if ((!propertyId && !investorProperty) || !investorId || !title || !dueDate) {
            setErrorMsg("Please fill in property, investor, title, and due date.");
            return;
        }
        const filled = recipients.filter((r) => r.role || r.name || r.phone || r.email);
        if (filled.some((r) => !r.phone?.trim() && !r.email?.trim())) {
            setErrorMsg("Each receiver needs a phone number or an email.");
            return;
        }
        setSubmitting(true);
        try {
            await onSubmit({
                propertyId: investorProperty ? undefined : propertyId,
                investorPropertyId: investorProperty?.id,
                investorId,
                offerId: offerId || undefined,
                title,
                description: description || undefined,
                dueDate,
                channel,
                // Always remind on the due date, plus the chosen repeat until then.
                remindDaysBefore: [0],
                repeatEvery,
                recipients: filled.map((r) => ({ ...r, role: r.role || "Other" })),
                sendNow,
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
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-black text-neutral-900">
                        <Bell className="h-5 w-5 text-amber-500" /> Add Reminder
                    </h2>
                    <button onClick={onClose} className="admin-action-btn" aria-label="Close">
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    {investorProperty ? (
                        <div className="rounded-xl bg-neutral-50 px-4 py-3 text-sm">
                            <span className="block text-xs font-bold text-neutral-500">Investor property</span>
                            <span className="font-bold text-neutral-900">{investorProperty.address}</span>
                        </div>
                    ) : (
                    <>
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
                    </>
                    )}

                    <FormInput
                        label="Reminder title *"
                        placeholder="e.g. Lawyer follow-up on SPA signing"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <FormTextarea
                        label="Description (optional)"
                        placeholder="Add details or notes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                    />

                    <SectionCard icon={Users} title="Remind To">
                        <p className="mb-3 text-xs text-neutral-500">
                            The investor always receives it. Add up to {MAX_REMINDER_RECIPIENTS} more people
                            {contacts.length ? " — pick a saved contact to fill in their details" : ""}.
                        </p>
                        <div className="space-y-3">
                            {recipients.map((r, i) => {
                                const saved = contacts.find((c) => c.role === r.role && c.name === r.name);
                                return (
                                    <div key={i} className="grid gap-2 sm:grid-cols-[110px_1fr]">
                                        <span className="self-center rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-neutral-800">
                                            Receiver {i + 1}
                                        </span>
                                        <div className="grid gap-2 sm:grid-cols-2">
                                            <select
                                                className={inputClass}
                                                value={saved ? `saved:${saved.role}` : r.role}
                                                onChange={(e) => pickRole(i, e.target.value)}
                                            >
                                                <option value="">Not used</option>
                                                {contacts.length > 0 && (
                                                    <optgroup label="Saved on this property">
                                                        {contacts.map((c) => (
                                                            <option key={c.role} value={`saved:${c.role}`}>
                                                                {c.role}
                                                                {c.name ? ` · ${c.name}` : ""}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                <optgroup label="Enter manually">
                                                    {MANUAL_ROLES.map((role) => (
                                                        <option key={role} value={role}>
                                                            {role}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            </select>
                                            <input
                                                className={inputClass}
                                                placeholder="Name"
                                                value={r.name}
                                                onChange={(e) => updateRecipient(i, { name: e.target.value })}
                                            />
                                            <input
                                                className={inputClass}
                                                type="tel"
                                                placeholder="Phone (WhatsApp)"
                                                value={r.phone ?? ""}
                                                onChange={(e) => updateRecipient(i, { phone: e.target.value })}
                                            />
                                            <input
                                                className={inputClass}
                                                type="email"
                                                placeholder="Email"
                                                value={r.email ?? ""}
                                                onChange={(e) => updateRecipient(i, { email: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </SectionCard>

                    <SectionCard icon={CalendarDays} title="Due Date" required>
                        <input className={inputClass} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                    </SectionCard>

                    <SectionCard icon={Bell} title="Notification" required>
                        <div className="grid gap-2 sm:grid-cols-3">
                            {REMINDER_REPEAT_OPTIONS.map((o) => (
                                <label
                                    key={o.value}
                                    className={cn(
                                        "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold",
                                        repeatEvery === o.value ? "border-blue-300 bg-blue-50" : "border-neutral-300 hover:border-neutral-500"
                                    )}
                                >
                                    <input
                                        type="radio"
                                        name="repeatEvery"
                                        checked={repeatEvery === o.value}
                                        onChange={() => setRepeatEvery(o.value)}
                                    />
                                    {o.label}
                                </label>
                            ))}
                        </div>
                        <p className="mt-2 text-xs text-neutral-500">Repeats until the due date, and is sent on the due date itself.</p>
                        <div className="mt-3">
                            <FormSelect
                                label="Send via"
                                value={channel}
                                onChange={(e) => setChannel(e.target.value as ReminderChannel)}
                            >
                                <option value="both">WhatsApp + Email</option>
                                <option value="whatsapp">WhatsApp only</option>
                                <option value="email">Email only</option>
                            </FormSelect>
                        </div>
                    </SectionCard>

                    <label className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                        <input type="checkbox" checked={sendNow} onChange={(e) => setSendNow(e.target.checked)} />
                        Send to investor and receivers now as well
                    </label>

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