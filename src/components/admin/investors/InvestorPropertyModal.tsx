"use client";

import { useEffect, useState } from "react";
import { Check, EyeOff, Loader2, Send, Sparkles, Trash2, XCircle } from "lucide-react";
import { AiHealthBadge } from "./AiHealthBadge";
import { DocumentsReview } from "./DocumentsReview";
import { useOfferPartners } from "@/hooks/useOfferPartners";
import { Modal } from "@/components/admin/ui/Modal";
import { FormInput, FormSelect, FormTextarea } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import { MoneyInput } from "@/components/admin/ui/MoneyInput";
import { cn } from "@/lib/utils";
import { formatDueIn } from "@/lib/reminders";
import { categoryProgress, formatDate, STAGE_LABELS } from "@/lib/investor";
import type {
    InvestorProperty,
    InvestorPropertyInput,
    InvestorStage,
    MilestoneCategory,
    UpdateCategory,
} from "@/types/investor";

type Tab = "details" | "checklist" | "updates" | "reminders" | "documents";

interface InvestorPropertyModalProps {
    property: InvestorProperty | null;
    onClose: () => void;
    onSave: (id: string, input: Partial<InvestorPropertyInput>) => Promise<void>;
    onToggleMilestone: (id: string, milestoneId: string, done: boolean) => Promise<void>;
    onAddUpdate: (id: string, category: UpdateCategory, message: string, visible: boolean) => Promise<void>;
    onAddReminder: (property: InvestorProperty) => void;
    onAnalyse: (id: string) => Promise<void>;
    onRefresh: () => Promise<void>;
    onSendReminder: (reminderId: string) => Promise<void>;
    onCancelReminder: (reminderId: string) => Promise<void>;
    onDeleteReminder: (reminderId: string) => Promise<void>;
}

const NUMBER_FIELDS: { key: keyof InvestorPropertyInput; label: string }[] = [
    { key: "purchasePrice", label: "Purchase price (RM)" },
    { key: "legalCost", label: "Legal cost (RM)" },
    { key: "renovationCost", label: "Renovation cost (RM)" },
    { key: "otherCost", label: "Other expenses (RM)" },
    { key: "sellingCost", label: "Est. selling cost (RM)" },
    { key: "targetPrice", label: "Target sale price (RM)" },
    { key: "highestOffer", label: "Highest offer (RM)" },
];

export function InvestorPropertyModal({
    property,
    onClose,
    onSave,
    onToggleMilestone,
    onAddUpdate,
    onAddReminder,
    onAnalyse,
    onRefresh,
    onSendReminder,
    onCancelReminder,
    onDeleteReminder,
}: InvestorPropertyModalProps) {
    const [tab, setTab] = useState<Tab>("details");
    const [form, setForm] = useState<Partial<InvestorPropertyInput>>({});
    const [saving, setSaving] = useState(false);
    const [updateCategory, setUpdateCategory] = useState<UpdateCategory>("legal");
    const [updateMessage, setUpdateMessage] = useState("");
    const [updateVisible, setUpdateVisible] = useState(true);
    const [busyReminder, setBusyReminder] = useState<string | null>(null);
    // Same registered partners as Admin → Legal / Financial Consultants.
    const { legalFirms, financingConsultants } = useOfferPartners(Boolean(property));

    const runReminder = async (id: string, fn: (id: string) => Promise<void>) => {
        setBusyReminder(id);
        try {
            await fn(id);
        } catch {
            // toast already shown
        } finally {
            setBusyReminder(null);
        }
    };

    useEffect(() => {
        if (!property) return;
        setForm({
            refNo: property.refNo ?? "",
            address: property.address,
            state: property.state ?? "",
            dateSigned: property.dateSigned ?? "",
            stage: property.stage,
            expectedCompletion: property.expectedCompletion ?? "",
            notes: property.notes ?? "",
            legalFirmId: property.legalFirmId ?? "",
            financingConsultantId: property.financingConsultantId ?? "",
            purchasePrice: property.purchasePrice,
            legalCost: property.legalCost,
            renovationCost: property.renovationCost,
            otherCost: property.otherCost,
            sellingCost: property.sellingCost,
            targetPrice: property.targetPrice,
            highestOffer: property.highestOffer,
        });
    }, [property]);

    if (!property) return null;

    const set = <K extends keyof InvestorPropertyInput>(key: K, value: InvestorPropertyInput[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(property.id, form);
        } finally {
            setSaving(false);
        }
    };

    const handlePostUpdate = async () => {
        if (!updateMessage.trim()) return;
        await onAddUpdate(property.id, updateCategory, updateMessage, updateVisible);
        setUpdateMessage("");
    };

    return (
        <Modal
            open
            onClose={onClose}
            wide
            title={property.address}
            description={`${property.refNo ? `No. ${property.refNo} · ` : ""}Signed ${property.dateSigned ? formatDate(property.dateSigned) : property.dateSignedNote ?? "—"}`}
        >
            <AiSummaryCard property={property} onAnalyse={() => onAnalyse(property.id)} />

            <div className="mb-5 flex gap-5 overflow-x-auto border-b border-neutral-200">
                {(["details", "checklist", "updates", "reminders", "documents"] as Tab[]).map((t) => (
                    <button
                        key={t}
                        type="button"
                        onClick={() => setTab(t)}
                        className={cn(
                            "whitespace-nowrap border-b-[3px] pb-3 text-sm font-bold capitalize",
                            tab === t ? "border-brand text-black" : "border-transparent text-neutral-500"
                        )}
                    >
                        {t}
                        {t === "reminders" && property.reminders.length > 0 && ` (${property.reminders.length})`}
                    </button>
                ))}
            </div>

            {tab === "details" && (
                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormInput label="Ref no." value={form.refNo ?? ""} onChange={(e) => set("refNo", e.target.value)} />
                        <FormSelect
                            label="Current stage"
                            value={form.stage}
                            onChange={(e) => set("stage", e.target.value as InvestorStage)}
                        >
                            {Object.entries(STAGE_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </FormSelect>
                        <div className="sm:col-span-2">
                            <FormInput label="Address" value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
                        </div>
                        <FormInput label="State" value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} />
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
                        <FormSelect
                            label="Legal firm (lawyer)"
                            value={form.legalFirmId ?? ""}
                            onChange={(e) => set("legalFirmId", e.target.value)}
                        >
                            <option value="">Not assigned</option>
                            {legalFirms.map((f) => (
                                <option key={f.id} value={f.id}>
                                    {f.name}
                                </option>
                            ))}
                        </FormSelect>
                        <FormSelect
                            label="Financing consultant"
                            value={form.financingConsultantId ?? ""}
                            onChange={(e) => set("financingConsultantId", e.target.value)}
                        >
                            <option value="">Not assigned</option>
                            {financingConsultants.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </FormSelect>
                        {NUMBER_FIELDS.map(({ key, label }) => (
                            <MoneyInput
                                key={key}
                                label={label}
                                value={Number(form[key] ?? 0)}
                                onChange={(v) => set(key, v as never)}
                            />
                        ))}
                    </div>
                    <FormTextarea
                        label="Internal notes (admin only)"
                        rows={3}
                        value={form.notes ?? ""}
                        onChange={(e) => set("notes", e.target.value)}
                    />
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : "Save details"}
                        </Button>
                    </div>
                </div>
            )}

            {tab === "checklist" && (
                <div className="grid gap-5 lg:grid-cols-3">
                    {(["legal", "renovation", "sales"] as MilestoneCategory[]).map((cat) => (
                        <div key={cat}>
                            <div className="mb-2 flex items-center justify-between">
                                <h4 className="text-sm font-black capitalize">{cat}</h4>
                                <span className="text-xs font-bold text-neutral-500">
                                    {categoryProgress(property.milestones, cat)}%
                                </span>
                            </div>
                            <div className="space-y-2">
                                {property.milestones
                                    .filter((m) => m.category === cat)
                                    .map((m) => (
                                        <button
                                            key={m.id}
                                            type="button"
                                            onClick={() => onToggleMilestone(property.id, m.id, !m.done)}
                                            className={cn(
                                                "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors",
                                                m.done
                                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "grid h-5 w-5 shrink-0 place-items-center rounded-full",
                                                    m.done ? "bg-emerald-600 text-white" : "bg-neutral-100"
                                                )}
                                            >
                                                {m.done && <Check className="h-3 w-3" />}
                                            </span>
                                            {m.label}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === "updates" && (
                <div className="space-y-5">
                    <div className="space-y-3 rounded-2xl border border-neutral-200 p-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormSelect
                                label="Category"
                                value={updateCategory}
                                onChange={(e) => setUpdateCategory(e.target.value as UpdateCategory)}
                            >
                                <option value="legal">Legal</option>
                                <option value="renovation">Renovation</option>
                                <option value="sales">Sales</option>
                                <option value="finance">Finance</option>
                                <option value="general">General</option>
                            </FormSelect>
                            <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold">
                                <input
                                    type="checkbox"
                                    checked={updateVisible}
                                    onChange={(e) => setUpdateVisible(e.target.checked)}
                                />
                                Visible to investor
                            </label>
                        </div>
                        <FormTextarea
                            label="Update"
                            rows={3}
                            placeholder="e.g. Documents submitted to the Land Office for registration."
                            value={updateMessage}
                            onChange={(e) => setUpdateMessage(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={handlePostUpdate} disabled={!updateMessage.trim()}>
                                Post update
                            </Button>
                        </div>
                    </div>
                    <ol className="space-y-3">
                        {property.updates.length === 0 && <p className="text-sm text-neutral-500">No updates yet.</p>}
                        {property.updates.map((u) => (
                            <li key={u.id} className="border-l-2 border-brand pl-4">
                                <p className="flex items-center gap-2 text-[11px] font-bold uppercase text-neutral-500">
                                    {formatDate(u.createdAt)} · {u.category}
                                    {!u.visibleToInvestor && (
                                        <span className="inline-flex items-center gap-1 text-amber-600">
                                            <EyeOff className="h-3 w-3" /> Admin only
                                        </span>
                                    )}
                                </p>
                                <p className="mt-1 text-sm text-neutral-800">{u.message}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {tab === "documents" && <DocumentsReview propertyId={property.id} onReviewed={onRefresh} />}

            {tab === "reminders" && (
                <div className="space-y-3">
                    <div className="flex justify-end">
                        <Button onClick={() => onAddReminder(property)}>Add reminder</Button>
                    </div>
                    {property.reminders.length === 0 && (
                        <p className="text-sm text-neutral-500">No reminders for this property.</p>
                    )}
                    {property.reminders.map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 px-4 py-3">
                            <div className="min-w-0">
                                <p className="text-sm font-bold">{r.title}</p>
                                <p className="text-xs text-neutral-500">
                                    {formatDate(r.dueDate)} · {r.status === "scheduled" ? formatDueIn(r.dueDate) : r.status}
                                    {" · "}
                                    <span className="uppercase">{r.channel === "both" ? "WhatsApp + Email" : r.channel}</span>
                                </p>
                                {r.lastSentAt && (
                                    <p className="text-[11px] text-neutral-400">Last sent {formatDate(r.lastSentAt)}</p>
                                )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                                <button
                                    type="button"
                                    className="admin-action-btn"
                                    title="Send now"
                                    disabled={busyReminder === r.id}
                                    onClick={() => runReminder(r.id, onSendReminder)}
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                                {r.status === "scheduled" && (
                                    <button
                                        type="button"
                                        className="admin-action-btn"
                                        title="Cancel"
                                        disabled={busyReminder === r.id}
                                        onClick={() => runReminder(r.id, onCancelReminder)}
                                    >
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className="admin-action-btn"
                                    title="Delete"
                                    disabled={busyReminder === r.id}
                                    onClick={() => confirm("Delete this reminder?") && runReminder(r.id, onDeleteReminder)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Modal>
    );
}

function AiSummaryCard({ property, onAnalyse }: { property: InvestorProperty; onAnalyse: () => Promise<void> }) {
    const [running, setRunning] = useState(false);
    const a = property.aiAnalysis;

    const run = async () => {
        setRunning(true);
        try {
            await onAnalyse();
        } catch {
            // toast already shown
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <p className="flex items-center gap-2 text-xs font-black uppercase text-amber-700">
                        <Sparkles className="h-3.5 w-3.5" /> AI check
                        <AiHealthBadge analysis={a} />
                    </p>
                    {a ? (
                        <>
                            {a.blocker && <p className="text-sm text-neutral-800">{a.blocker}</p>}
                            <p className="text-xs text-neutral-600">
                                <b>Next action:</b> {a.next_action}
                            </p>
                            <p className="text-[11px] text-neutral-500">
                                Investor sees: &ldquo;{a.investor_message}&rdquo; · checked {formatDate(property.aiAnalyzedAt)}
                            </p>
                        </>
                    ) : (
                        <p className="text-sm text-neutral-600">Not checked yet.</p>
                    )}
                </div>
                <Button variant="secondary" size="sm" onClick={run} disabled={running}>
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {a ? "Re-check" : "Check now"}
                </Button>
            </div>
        </div>
    );
}
