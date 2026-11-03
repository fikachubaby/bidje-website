"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BellRing, Mail, Pencil, Phone } from "lucide-react";
import { FormInput, FormSelect } from "@/components/admin/ui/FormField";
import { Button } from "@/components/ui/ButtonProps";
import type { InvestorProperty } from "@/types/investor";

interface Partner {
    id: string;
    name: string;
    contactPerson: string | null;
    email: string | null;
    phone: string | null;
    own: boolean;
}

type OnUpdated = (property: InvestorProperty) => void;

const OTHER = "__other__";
const EMPTY_LEGAL = { name: "", contactPerson: "", email: "", phone: "", address: "" };

async function postJson(url: string, body: unknown, method = "POST") {
    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
}

function PartnerOptions({ partners }: { partners: Partner[] }) {
    const bidje = partners.filter((p) => !p.own);
    const own = partners.filter((p) => p.own);
    return (
        <>
            <option value="">Not chosen yet</option>
            {bidje.length > 0 && (
                <optgroup label="Bidje partners">
                    {bidje.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </optgroup>
            )}
            {own.length > 0 && (
                <optgroup label="Added by you">
                    {own.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </optgroup>
            )}
            <option value={OTHER}>Other (enter details)</option>
        </>
    );
}

/** The investor's legal firm and financing consultant: pick a Bidje partner, add their own, and alert the lawyer. */
export function TeamCard({ property, onUpdated }: { property: InvestorProperty; onUpdated: OnUpdated }) {
    const [editing, setEditing] = useState(false);
    const [legalFirms, setLegalFirms] = useState<Partner[]>([]);
    const [consultants, setConsultants] = useState<Partner[]>([]);
    const [legalId, setLegalId] = useState("");
    const [consultantId, setConsultantId] = useState("");
    const [newLegal, setNewLegal] = useState(EMPTY_LEGAL);
    const [newConsultantName, setNewConsultantName] = useState("");
    const [saving, setSaving] = useState(false);

    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyMessage, setNotifyMessage] = useState("");
    const [notifying, setNotifying] = useState(false);

    const hasTeam = Boolean(property.legalFirm || property.financingConsultant);

    useEffect(() => {
        setLegalId(property.legalFirmId ?? "");
        setConsultantId(property.financingConsultantId ?? "");
        setNewLegal(EMPTY_LEGAL);
        setNewConsultantName("");
        setEditing(!hasTeam);
        setNotifyOpen(false);
    }, [property.id, property.legalFirmId, property.financingConsultantId, hasTeam]);

    useEffect(() => {
        if (!editing) return;
        fetch("/api/investor/partners")
            .then((res) => res.json())
            .then((data) => {
                setLegalFirms(data.legalFirms ?? []);
                setConsultants(data.financingConsultants ?? []);
            })
            .catch(() => toast.error("Failed to load legal firms and consultants"));
    }, [editing]);

    const save = async () => {
        setSaving(true);
        try {
            let legalFirmId = legalId;
            let financingConsultantId = consultantId;

            if (legalId === OTHER) {
                const { partner } = await postJson("/api/investor/partners", { kind: "legal", ...newLegal });
                legalFirmId = partner.id;
            }
            if (consultantId === OTHER) {
                const { partner } = await postJson("/api/investor/partners", { kind: "financing", name: newConsultantName });
                financingConsultantId = partner.id;
            }

            const { property: updated } = await postJson(
                `/api/investor/portfolio/${property.id}`,
                { legalFirmId, financingConsultantId },
                "PATCH"
            );
            onUpdated(updated);
            toast.success("Your team is saved");
            setEditing(false);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const notifyLawyer = async () => {
        setNotifying(true);
        try {
            const { results } = await postJson(`/api/investor/portfolio/${property.id}/notify-legal`, { message: notifyMessage });
            const label = (channel: string) => (channel === "email" ? "email" : "WhatsApp");
            const typed = results as { channel: string; ok: boolean; error?: string }[];
            toast.success(`${property.legalFirm?.name} has been notified by ${typed.filter((r) => r.ok).map((r) => label(r.channel)).join(" and ")}`);
            for (const r of typed.filter((x) => !x.ok)) toast.warning(`${label(r.channel)} couldn't be sent: ${r.error}`);
            setNotifyOpen(false);
            setNotifyMessage("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to notify your lawyer");
        } finally {
            setNotifying(false);
        }
    };

    const legalOther = legalId === OTHER;
    const canSave =
        (!legalOther || (newLegal.name.trim() && (newLegal.email.trim() || newLegal.phone.trim()))) &&
        (consultantId !== OTHER || newConsultantName.trim());

    return (
        <div className="rounded-xl border border-neutral-200 p-3 text-sm">
            <div className="mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase text-neutral-500">Your team</p>
                {!editing && (
                    <button type="button" onClick={() => setEditing(true)} className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-100" aria-label="Edit your team">
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {editing ? (
                <div className="space-y-3">
                    <FormSelect label="Legal firm (lawyer)" value={legalId} onChange={(e) => setLegalId(e.target.value)}>
                        <PartnerOptions partners={legalFirms} />
                    </FormSelect>
                    {legalOther && (
                        <div className="grid gap-3 rounded-xl bg-neutral-50 p-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <FormInput label="Firm name *" value={newLegal.name} onChange={(e) => setNewLegal({ ...newLegal, name: e.target.value })} />
                            </div>
                            <FormInput label="Contact person" value={newLegal.contactPerson} onChange={(e) => setNewLegal({ ...newLegal, contactPerson: e.target.value })} />
                            <FormInput label="Phone (WhatsApp)" type="tel" value={newLegal.phone} onChange={(e) => setNewLegal({ ...newLegal, phone: e.target.value })} />
                            <FormInput label="Email" type="email" value={newLegal.email} onChange={(e) => setNewLegal({ ...newLegal, email: e.target.value })} />
                            <FormInput label="Address" value={newLegal.address} onChange={(e) => setNewLegal({ ...newLegal, address: e.target.value })} />
                            <p className="text-xs text-neutral-500 sm:col-span-2">An email or phone number is needed so we can notify the firm for you.</p>
                        </div>
                    )}

                    <FormSelect label="Financing consultant" value={consultantId} onChange={(e) => setConsultantId(e.target.value)}>
                        <PartnerOptions partners={consultants} />
                    </FormSelect>
                    {consultantId === OTHER && (
                        <div className="rounded-xl bg-neutral-50 p-3">
                            <FormInput label="Consultant name *" value={newConsultantName} onChange={(e) => setNewConsultantName(e.target.value)} />
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        {hasTeam && (
                            <Button size="sm" variant="secondary" onClick={() => setEditing(false)} disabled={saving}>
                                Cancel
                            </Button>
                        )}
                        <Button size="sm" onClick={save} disabled={saving || !canSave}>
                            {saving ? "Saving..." : "Save team"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-1">
                    {property.legalFirm && (
                        <p>
                            ⚖️ <b>{property.legalFirm.name}</b>
                            <span className="text-neutral-500">
                                {" "}
                                · Lawyer
                                {property.legalFirm.contactPerson ? ` · ${property.legalFirm.contactPerson}` : ""}
                            </span>
                            {property.legalFirm.phone && (
                                <a href={`tel:${property.legalFirm.phone}`} className="ml-2 inline-flex items-center gap-1 text-neutral-600 underline">
                                    <Phone className="h-3 w-3" /> {property.legalFirm.phone}
                                </a>
                            )}
                            {property.legalFirm.email && (
                                <a href={`mailto:${property.legalFirm.email}`} className="ml-2 inline-flex items-center gap-1 text-neutral-600 underline">
                                    <Mail className="h-3 w-3" /> {property.legalFirm.email}
                                </a>
                            )}
                        </p>
                    )}
                    {property.financingConsultant && (
                        <p>
                            💰 <b>{property.financingConsultant.name}</b>
                            <span className="text-neutral-500"> · Financing consultant</span>
                        </p>
                    )}

                    {property.legalFirm && (property.legalFirm.email || property.legalFirm.phone) && (
                        <div className="pt-2">
                            {notifyOpen ? (
                                <div className="space-y-2 rounded-xl bg-neutral-50 p-3">
                                    <p className="text-xs text-neutral-600">
                                        We&apos;ll send {property.legalFirm.name} an email and WhatsApp with this property&apos;s details and your contact.
                                    </p>
                                    <textarea
                                        value={notifyMessage}
                                        onChange={(e) => setNotifyMessage(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        placeholder="Optional message, e.g. Please send me the SPA draft by Friday."
                                        className="w-full rounded-xl border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setNotifyOpen(false)} disabled={notifying}>
                                            Cancel
                                        </Button>
                                        <Button size="sm" onClick={notifyLawyer} disabled={notifying}>
                                            {notifying ? "Sending..." : "Send alert"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button size="sm" variant="secondary" onClick={() => setNotifyOpen(true)}>
                                    <BellRing className="h-4 w-4" /> Notify my lawyer
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
