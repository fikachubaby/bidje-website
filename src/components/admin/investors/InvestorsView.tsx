"use client";

import { useEffect, useMemo, useState } from "react";
import { BellRing, FileUp, Plus, Search, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { ConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/ui/ButtonProps";
import { cn } from "@/lib/utils";
import { formatDueIn } from "@/lib/reminders";
import {
    categoryProgress,
    formatDate,
    guessState,
    STAGE_BADGE,
    STAGE_LABELS,
} from "@/lib/investor";
import { useInvestorProperties, useInvestors } from "@/hooks/useInvestorProperties";
import { AddReminderModal } from "@/components/admin/reminders/AddReminderModal";
import type { ReminderFormInput } from "@/types/reminder";
import type { InvestorProperty, InvestorStage } from "@/types/investor";
import { ImportPropertiesModal } from "./ImportPropertiesModal";
import { InvestorPropertyModal } from "./InvestorPropertyModal";

function nextReminder(p: InvestorProperty) {
    return p.reminders.find((r) => r.status === "scheduled");
}

function isOverdue(dueDate: string) {
    return new Date(dueDate).getTime() < Date.now() - 86400000;
}

function MiniBar({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex items-center gap-2" title={`${label} ${value}%`}>
            <span className="w-3 text-[10px] font-black text-neutral-400">{label}</span>
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100">
                <div className="h-full rounded-full bg-brand" style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

export function InvestorsView() {
    const { investors, loading: loadingInvestors, refresh: refreshInvestors, promoteToInvestor } = useInvestors();
    const [investorSearch, setInvestorSearch] = useState("");
    const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);
    const {
        properties,
        loading,
        refresh,
        createProperty,
        importRows,
        updateProperty,
        deleteProperty,
        toggleMilestone,
        addUpdate,
        sendReminder,
        cancelReminder,
        deleteReminder,
    } = useInvestorProperties(selectedInvestorId);

    const [search, setSearch] = useState("");
    const [stageFilter, setStageFilter] = useState<InvestorStage | "all" | "overdue">("all");
    const [importOpen, setImportOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [newSigned, setNewSigned] = useState("");
    const [openPropertyId, setOpenPropertyId] = useState<string | null>(null);
    const [reminderFor, setReminderFor] = useState<InvestorProperty | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const selectedInvestor = investors.find((i) => i.id === selectedInvestorId) ?? null;
    const openProperty = properties.find((p) => p.id === openPropertyId) ?? null;

    useEffect(() => {
        if (!selectedInvestorId && investors.length) {
            setSelectedInvestorId((investors.find((i) => i.role === "investor") ?? investors[0]).id);
        }
    }, [investors, selectedInvestorId]);

    const filteredInvestors = useMemo(() => {
        const q = investorSearch.toLowerCase();
        return investors
            .filter((i) => !q || `${i.fullName ?? ""} ${i.email}`.toLowerCase().includes(q))
            .sort((a, b) => Number(b.role === "investor") - Number(a.role === "investor"));
    }, [investors, investorSearch]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return properties.filter((p) => {
            if (q && !`${p.address} ${p.refNo ?? ""} ${p.state ?? ""}`.toLowerCase().includes(q)) return false;
            if (stageFilter === "overdue") {
                const r = nextReminder(p);
                return Boolean(r && isOverdue(r.dueDate));
            }
            return stageFilter === "all" || p.stage === stageFilter;
        });
    }, [properties, search, stageFilter]);

    const counts = useMemo(() => {
        const byStage = (s: InvestorStage) => properties.filter((p) => p.stage === s).length;
        return {
            total: properties.length,
            legal: byStage("legal"),
            renovation: byStage("renovation"),
            selling: byStage("for_sale") + byStage("sold"),
            overdue: properties.filter((p) => {
                const r = nextReminder(p);
                return r && isOverdue(r.dueDate);
            }).length,
        };
    }, [properties]);

    const handleAdd = async () => {
        if (!selectedInvestorId || !newAddress.trim()) return;
        await createProperty({
            investorId: selectedInvestorId,
            address: newAddress.trim(),
            state: guessState(newAddress),
            dateSigned: newSigned || null,
        });
        setNewAddress("");
        setNewSigned("");
        setAddOpen(false);
        refreshInvestors();
    };

    const handleCreateReminder = async (input: ReminderFormInput) => {
        const res = await fetch("/api/reminders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
        });
        if (!res.ok) {
            toast.error("Failed to create reminder");
            throw new Error("Failed to create reminder");
        }
        toast.success("Reminder created");
        await refresh();
    };

    const stats = [
        { key: "all", label: "Properties", value: counts.total },
        { key: "legal", label: "In legal", value: counts.legal },
        { key: "renovation", label: "Renovation", value: counts.renovation },
        { key: "for_sale", label: "For sale / sold", value: counts.selling },
        { key: "overdue", label: "Overdue reminders", value: counts.overdue },
    ] as const;

    return (
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
            {/* Investor picker */}
            <aside className="rounded-2xl border border-neutral-200 bg-white p-4 xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto">
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    <input
                        value={investorSearch}
                        onChange={(e) => setInvestorSearch(e.target.value)}
                        placeholder="Search investors..."
                        className="w-full rounded-xl border border-neutral-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-neutral-900"
                    />
                </div>
                {loadingInvestors && <p className="p-2 text-sm text-neutral-500">Loading...</p>}
                <div className="space-y-1">
                    {filteredInvestors.map((inv) => (
                        <button
                            key={inv.id}
                            type="button"
                            onClick={() => setSelectedInvestorId(inv.id)}
                            className={cn(
                                "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors",
                                inv.id === selectedInvestorId ? "bg-brand text-black" : "hover:bg-neutral-100"
                            )}
                        >
                            <span className="min-w-0">
                                <span className="block truncate text-sm font-bold">{inv.fullName ?? inv.email}</span>
                                <span className="block truncate text-[11px] text-neutral-500">
                                    {inv.role === "investor" ? "Investor" : "Subscriber"} · {inv.email}
                                </span>
                            </span>
                            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-xs font-black">
                                {inv.propertyCount}
                            </span>
                        </button>
                    ))}
                </div>
            </aside>

            <div className="min-w-0 space-y-5">
                {!selectedInvestor ? (
                    <p className="text-sm text-neutral-500">Select an investor to manage their portfolio.</p>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                                <h2 className="text-2xl font-black">{selectedInvestor.fullName ?? selectedInvestor.email}</h2>
                                <p className="text-sm text-neutral-500">
                                    {selectedInvestor.email}
                                    {selectedInvestor.phone ? ` · ${selectedInvestor.phone}` : ""}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {selectedInvestor.role !== "investor" && (
                                    <Button variant="secondary" onClick={() => promoteToInvestor(selectedInvestor.id)}>
                                        <UserPlus className="h-4 w-4" /> Make investor
                                    </Button>
                                )}
                                <Button variant="secondary" onClick={() => setImportOpen(true)}>
                                    <FileUp className="h-4 w-4" /> Import sheet
                                </Button>
                                <Button onClick={() => setAddOpen(true)}>
                                    <Plus className="h-4 w-4" /> Add property
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                            {stats.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setStageFilter(s.key)}
                                    className={cn(
                                        "rounded-2xl border bg-white p-4 text-left transition-colors",
                                        stageFilter === s.key ? "border-neutral-900" : "border-neutral-200 hover:border-neutral-400",
                                        s.key === "overdue" && s.value > 0 && "text-red-700"
                                    )}
                                >
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-500">{s.label}</p>
                                    <p className="mt-2 text-2xl font-black">{s.value}</p>
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row">
                            <div className="flex-1">
                                <FormInput
                                    
                                    placeholder="Search address, no., or state..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="md:w-56">
                                <FormSelect
                                    
                                    value={stageFilter}
                                    onChange={(e) => setStageFilter(e.target.value as typeof stageFilter)}
                                >
                                    <option value="all">All stages</option>
                                    {Object.entries(STAGE_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>
                                            {l}
                                        </option>
                                    ))}
                                    <option value="overdue">Overdue reminders</option>
                                </FormSelect>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
                            <table className="w-full min-w-[860px] text-left text-sm">
                                <thead className="border-b border-neutral-200 bg-neutral-50 text-xs font-bold text-neutral-500">
                                    <tr>
                                        <th className="px-4 py-3">No.</th>
                                        <th className="px-4 py-3">Address</th>
                                        <th className="px-4 py-3">Signed</th>
                                        <th className="px-4 py-3">Stage</th>
                                        <th className="px-4 py-3">Progress</th>
                                        <th className="px-4 py-3">Next reminder</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                                                Loading...
                                            </td>
                                        </tr>
                                    )}
                                    {!loading && filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-neutral-500">
                                                {properties.length
                                                    ? "No properties match the filter."
                                                    : "No properties yet. Import the investor's sheet to get started."}
                                            </td>
                                        </tr>
                                    )}
                                    {!loading &&
                                        filtered.map((p) => {
                                            const r = nextReminder(p);
                                            return (
                                                <tr
                                                    key={p.id}
                                                    onClick={() => setOpenPropertyId(p.id)}
                                                    className="cursor-pointer border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                                                >
                                                    <td className="px-4 py-3 text-neutral-500">{p.refNo ?? "—"}</td>
                                                    <td className="max-w-sm px-4 py-3">
                                                        <p className="font-bold text-neutral-900">{p.address}</p>
                                                        <p className="text-xs text-neutral-500">{p.state ?? ""}</p>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3">
                                                        {p.dateSigned ? formatDate(p.dateSigned) : (
                                                            <span className="text-amber-600">{p.dateSignedNote ?? "Not set"}</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", STAGE_BADGE[p.stage])}>
                                                            {STAGE_LABELS[p.stage]}
                                                        </span>
                                                    </td>
                                                    <td className="space-y-1 px-4 py-3">
                                                        <MiniBar label="L" value={categoryProgress(p.milestones, "legal")} />
                                                        <MiniBar label="R" value={categoryProgress(p.milestones, "renovation")} />
                                                        <MiniBar label="S" value={categoryProgress(p.milestones, "sales")} />
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {r ? (
                                                            <>
                                                                <p className="max-w-[180px] truncate text-xs font-bold">{r.title}</p>
                                                                <p className={cn("text-xs", isOverdue(r.dueDate) ? "text-red-600" : "text-neutral-500")}>
                                                                    {formatDueIn(r.dueDate)}
                                                                </p>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-neutral-400">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                title="Add reminder"
                                                                onClick={() => setReminderFor(p)}
                                                            >
                                                                <BellRing className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="admin-action-btn"
                                                                title="Delete"
                                                                onClick={() => setDeleteId(p.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            <ImportPropertiesModal
                open={importOpen}
                investorName={selectedInvestor?.fullName ?? selectedInvestor?.email ?? ""}
                onClose={() => setImportOpen(false)}
                onImport={async (rows) => {
                    await importRows(rows);
                    refreshInvestors();
                }}
            />

            <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add property">
                <div className="space-y-4">
                    <FormInput label="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                    <FormInput label="Date signed" type="date" value={newSigned} onChange={(e) => setNewSigned(e.target.value)} />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setAddOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAdd} disabled={!newAddress.trim()}>
                            Add
                        </Button>
                    </div>
                </div>
            </Modal>

            <InvestorPropertyModal
                property={openProperty}
                onClose={() => setOpenPropertyId(null)}
                onSave={updateProperty}
                onToggleMilestone={toggleMilestone}
                onAddUpdate={addUpdate}
                onAddReminder={setReminderFor}
                onSendReminder={sendReminder}
                onCancelReminder={cancelReminder}
                onDeleteReminder={deleteReminder}
            />

            {reminderFor && (
                <AddReminderModal
                    properties={[]}
                    investorProperty={{
                        id: reminderFor.id,
                        investorId: reminderFor.investorId,
                        address: reminderFor.address,
                    }}
                    onClose={() => setReminderFor(null)}
                    onSubmit={handleCreateReminder}
                />
            )}

            <ConfirmDialog
                open={Boolean(deleteId)}
                title="Remove property?"
                danger
                description="This removes the property, its checklist, updates and reminders from the investor's portfolio."
                confirmLabel="Remove"
                onCancel={() => setDeleteId(null)}
                onConfirm={async () => {
                    if (deleteId) await deleteProperty(deleteId);
                    setDeleteId(null);
                    refreshInvestors();
                }}
            />
        </div>
    );
}
