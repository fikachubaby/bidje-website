"use client";

import type { ReactNode } from "react";
import {
    BarChart3,
    FileText,
    HardHat,
    Home,
    Scale,
    User,
    Users,
    Wallet,
    type LucideIcon,
} from "lucide-react";
import { MoneyInput } from "@/components/admin/ui/MoneyInput";
import { MALAYSIAN_STATES } from "@/constants/locations";
import { cn } from "@/lib/utils";
import { formatDate, money, STAGE_LABELS, TRANSACTION_DETAIL_KEYS, type TransactionDetailKey } from "@/lib/investor";
import type { InvestorProperty, InvestorPropertyDetails, InvestorPropertyInput } from "@/types/investor";

/* ---------------------------------------------------------------------------
 * One config drives both the admin edit form and the investor read-only view,
 * so a field only ever needs to be added here.
 * ------------------------------------------------------------------------- */

type FieldType = "text" | "tel" | "email" | "date" | "money" | "state" | "stage" | "legalFirm" | "consultant";

interface FieldDef {
    /** A property column (camelCase) or a key inside `details`. */
    key: keyof InvestorPropertyInput | TransactionDetailKey;
    label: string;
    type?: FieldType;
    placeholder?: string;
    /** Take the full row. */
    full?: boolean;
    required?: boolean;
    /** Admin-only (hidden from the investor view). */
    adminOnly?: boolean;
}

interface SectionDef {
    id: string;
    title: string;
    icon: LucideIcon;
    fields: FieldDef[];
}

const PHONE = "e.g. 012-345 6789";

/** Name / phone / email trio used by every contact person. */
function contact(prefix: string, label: string, namePlaceholder = `Enter ${label.toLowerCase()}`): FieldDef[] {
    return [
        { key: `${prefix}Name` as TransactionDetailKey, label, placeholder: namePlaceholder },
        { key: `${prefix}Phone` as TransactionDetailKey, label: "Phone number", type: "tel", placeholder: PHONE },
        { key: `${prefix}Email` as TransactionDetailKey, label: "Email", type: "email", placeholder: "e.g. name@email.com" },
    ];
}

export const TRANSACTION_SECTIONS: SectionDef[] = [
    {
        id: "property",
        title: "Property Details",
        icon: Home,
        fields: [
            { key: "address", label: "Address", placeholder: "Enter property address", full: true, required: true },
            { key: "refNo", label: "Ref no.", adminOnly: true },
            { key: "stage", label: "Current stage", type: "stage" },
            { key: "state", label: "State", type: "state" },
            { key: "lotNo", label: "Lot no", placeholder: "e.g. Lot 12345" },
            { key: "titleNo", label: "Title no", placeholder: "e.g. Geran 67890" },
            { key: "mukim", label: "Mukim", placeholder: "e.g. Mukim Johor Bahru" },
            { key: "daerah", label: "Daerah (district)", placeholder: "e.g. Johor Bahru" },
            { key: "dateSigned", label: "Date signed", type: "date" },
            { key: "expectedCompletion", label: "Expected completion", type: "date" },
        ],
    },
    {
        id: "finance",
        title: "Costs & Sale",
        icon: Wallet,
        fields: [
            { key: "purchasePrice", label: "Property price (RM)", type: "money" },
            { key: "renovationCost", label: "Renovation cost (RM)", type: "money" },
            { key: "sellingPrice", label: "Selling price (RM)", type: "money" },
            { key: "agentFee", label: "Agent fee (RM)", type: "money" },
            { key: "legalCost", label: "Legal cost (RM)", type: "money" },
            { key: "otherCost", label: "Other expenses (RM)", type: "money" },
            { key: "sellingCost", label: "Est. selling cost (RM)", type: "money" },
            { key: "targetPrice", label: "Target sale price (RM)", type: "money" },
            { key: "highestOffer", label: "Highest offer (RM)", type: "money" },
        ],
    },
    {
        id: "legal",
        title: "Legal Consultant Information",
        icon: Scale,
        fields: [
            { key: "legalFirmId", label: "Law firm", type: "legalFirm", full: true },
            ...contact("lawyerPic1", "PIC 1 name"),
            ...contact("lawyerPic2", "PIC 2 name"),
        ],
    },
    {
        id: "contractor",
        title: "Contractor Information",
        icon: HardHat,
        fields: [
            { key: "contractorName", label: "Company name", placeholder: "Enter company name" },
            { key: "contractorPic", label: "PIC name", placeholder: "Enter PIC name" },
            { key: "contractorPhone", label: "Phone number", type: "tel", placeholder: PHONE },
            { key: "contractorEmail", label: "Email", type: "email", placeholder: "e.g. contractor@company.com" },
        ],
    },
    {
        id: "consultant",
        title: "Consultant Information",
        icon: Users,
        fields: [
            { key: "financingConsultantId", label: "Company name", type: "consultant", full: true },
            ...contact("consultantPic1", "PIC 1 name"),
            ...contact("consultantPic2", "PIC 2 name"),
        ],
    },
    {
        id: "purchaser",
        title: "Purchaser Information",
        icon: User,
        fields: [...contact("purchaser", "Purchaser name"), ...contact("agent", "Agent name")],
    },
    {
        id: "loan",
        title: "Loan Agreement Lawyer",
        icon: FileText,
        fields: [
            { key: "loanLawFirm", label: "Law firm name", placeholder: "Enter law firm name", full: true },
            ...contact("loanLawyer", "Lawyer name"),
            ...contact("loanPic", "PIC name"),
        ],
    },
    {
        id: "stages",
        title: "Stage Timeframes",
        icon: BarChart3,
        fields: [
            { key: "legalStart", label: "Legal · start", type: "date" },
            { key: "renovationStart", label: "Renovation · start", type: "date" },
            { key: "salesStart", label: "Sales · start", type: "date" },
            { key: "legalEnd", label: "Legal · expected completion", type: "date" },
            { key: "renovationEnd", label: "Renovation · expected completion", type: "date" },
            { key: "salesEnd", label: "Sales · expected completion", type: "date" },
        ],
    },
];

/* ------------------------------------------------------------------------- */

const DETAIL_KEYS = new Set<string>(TRANSACTION_DETAIL_KEYS);
const isDetailKey = (key: string): key is TransactionDetailKey => DETAIL_KEYS.has(key);

export type TransactionForm = Partial<InvestorPropertyInput> & { details?: InvestorPropertyDetails };

/** Editable copy of a property, or a blank form when adding a new one. */
export function toTransactionForm(p?: InvestorProperty): TransactionForm {
    const form: Record<string, unknown> = { details: { ...p?.details }, notes: p?.notes ?? "" };
    for (const section of TRANSACTION_SECTIONS) {
        for (const f of section.fields) {
            if (isDetailKey(f.key)) continue;
            const value = p?.[f.key as keyof InvestorProperty];
            if (f.type === "money") form[f.key] = Number(value ?? 0);
            else if (f.type === "stage") form[f.key] = value ?? "legal";
            else form[f.key] = value ?? "";
        }
    }
    return form as TransactionForm;
}

function readValue(source: TransactionForm | InvestorProperty, key: FieldDef["key"]): unknown {
    return isDetailKey(key) ? source.details?.[key] : (source as Record<string, unknown>)[key];
}

function Section({ section, children }: { section: SectionDef; children: ReactNode }) {
    const Icon = section.icon;
    return (
        <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <header className="flex items-center gap-2 border-b border-brand-muted bg-brand-muted/50 px-4 py-2.5">
                <Icon className="h-4 w-4 shrink-0 text-neutral-800" />
                <h3 className="text-sm font-black text-neutral-900">{section.title}</h3>
            </header>
            <div className="grid gap-x-4 gap-y-3 p-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
        </section>
    );
}

function Label({ field, children }: { field: FieldDef; children: ReactNode }) {
    return (
        <label className={cn("block text-xs font-bold text-neutral-700", field.full && "sm:col-span-2 lg:col-span-3")}>
            {field.label}
            {field.required && <span className="text-red-500"> *</span>}
            {children}
        </label>
    );
}

const inputClass =
    "mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-normal text-neutral-900 placeholder:text-neutral-400 outline-none hover:border-neutral-500 focus:border-black focus:ring-2 focus:ring-black/5";

/* ------------------------------ Admin form ------------------------------ */

interface PartnerChoice {
    id: string;
    name: string;
}

interface TransactionDetailsFormProps {
    /** The saved property; omit when adding a new one. */
    property?: InvestorProperty;
    form: TransactionForm;
    onChange: (form: TransactionForm) => void;
    legalFirms: PartnerChoice[];
    financingConsultants: PartnerChoice[];
}

/** Partner options, keeping a firm the investor added themselves selectable (it isn't in the partner list). */
function PartnerSelect({
    value,
    onChange,
    options,
    current,
}: {
    value: string;
    onChange: (id: string) => void;
    options: PartnerChoice[];
    current?: PartnerChoice | null;
}) {
    const showCurrent = current && !options.some((o) => o.id === current.id);
    return (
        <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">Not assigned</option>
            {showCurrent && <option value={current.id}>{current.name} (added by investor)</option>}
            {options.map((o) => (
                <option key={o.id} value={o.id}>
                    {o.name}
                </option>
            ))}
        </select>
    );
}

export function TransactionDetailsForm({ property, form, onChange, legalFirms, financingConsultants }: TransactionDetailsFormProps) {
    const setValue = (key: FieldDef["key"], value: unknown) =>
        onChange(isDetailKey(key) ? { ...form, details: { ...form.details, [key]: value as string } } : { ...form, [key]: value });

    const renderInput = (f: FieldDef) => {
        const value = readValue(form, f.key);
        const str = (value as string) ?? "";
        switch (f.type) {
            case "money":
                return <MoneyInput className={inputClass} value={Number(value ?? 0)} onChange={(v) => setValue(f.key, v)} />;
            case "stage":
                return (
                    <select className={inputClass} value={str} onChange={(e) => setValue(f.key, e.target.value)}>
                        {Object.entries(STAGE_LABELS).map(([v, label]) => (
                            <option key={v} value={v}>
                                {label}
                            </option>
                        ))}
                    </select>
                );
            case "state":
                return (
                    <select className={inputClass} value={str} onChange={(e) => setValue(f.key, e.target.value)}>
                        <option value="">Select state</option>
                        {/* Keep older free-text values that aren't in the list */}
                        {str && !(MALAYSIAN_STATES as readonly string[]).includes(str) && <option value={str}>{str}</option>}
                        {MALAYSIAN_STATES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                );
            case "legalFirm":
                return (
                    <PartnerSelect
                        value={str}
                        onChange={(id) => setValue(f.key, id)}
                        options={legalFirms}
                        current={property?.legalFirmId && property.legalFirm ? { id: property.legalFirmId, name: property.legalFirm.name } : null}
                    />
                );
            case "consultant":
                return (
                    <PartnerSelect
                        value={str}
                        onChange={(id) => setValue(f.key, id)}
                        options={financingConsultants}
                        current={
                            property?.financingConsultantId && property.financingConsultant
                                ? { id: property.financingConsultantId, name: property.financingConsultant.name }
                                : null
                        }
                    />
                );
            default:
                return (
                    <input
                        className={inputClass}
                        type={f.type ?? "text"}
                        placeholder={f.placeholder}
                        value={str}
                        onChange={(e) => setValue(f.key, e.target.value)}
                    />
                );
        }
    };

    return (
        <div className="space-y-4">
            {TRANSACTION_SECTIONS.map((section) => (
                <Section key={section.id} section={section}>
                    {section.fields.map((f) => (
                        <Label key={f.key} field={f}>
                            {renderInput(f)}
                            {f.type === "legalFirm" && property && form.legalFirmId === property.legalFirmId && (
                                <LawyerContact property={property} />
                            )}
                        </Label>
                    ))}
                </Section>
            ))}
        </div>
    );
}

/** Lawyer details come from the linked law firm's profile. */
function LawyerContact({ property }: { property: InvestorProperty }) {
    const firm = property.legalFirm;
    if (!firm) return null;
    const parts = [firm.contactPerson && `Lawyer: ${firm.contactPerson}`, firm.phone, firm.email].filter(Boolean);
    if (!parts.length) return null;
    return <span className="mt-1 block text-xs font-normal text-neutral-500">{parts.join(" · ")}</span>;
}

/* ---------------------------- Investor view ---------------------------- */

function displayValue(property: InvestorProperty, f: FieldDef): string | null {
    switch (f.type) {
        case "legalFirm":
            return property.legalFirm?.name ?? null;
        case "consultant":
            return property.financingConsultant?.name ?? null;
        case "stage":
            return STAGE_LABELS[property.stage];
    }
    const value = readValue(property, f.key);
    if (f.type === "money") return Number(value) ? money(Number(value)) : null;
    if (!value) return null;
    return f.type === "date" ? formatDate(value as string) : String(value);
}

/** Read-only, sectioned transaction details for the investor dashboard. */
export function TransactionDetailsView({ property }: { property: InvestorProperty }) {
    return (
        <div className="space-y-4">
            {TRANSACTION_SECTIONS.map((section) => {
                const rows = section.fields
                    .filter((f) => !f.adminOnly)
                    .map((f) => ({ field: f, value: displayValue(property, f) }));
                const empty = rows.every((r) => !r.value);
                return (
                    <Section key={section.id} section={section}>
                        {empty ? (
                            <p className="text-sm text-neutral-500 sm:col-span-2 lg:col-span-3">Not provided yet.</p>
                        ) : (
                            rows.map(({ field, value }) => (
                                <div key={field.key} className={cn("min-w-0", field.full && "sm:col-span-2 lg:col-span-3")}>
                                    <p className="text-[11px] font-bold uppercase text-neutral-500">{field.label}</p>
                                    <p className="mt-0.5 break-words text-sm font-semibold text-neutral-900">
                                        {value ?? <span className="font-normal text-neutral-400">—</span>}
                                    </p>
                                    {field.type === "legalFirm" && <LawyerContact property={property} />}
                                </div>
                            ))
                        )}
                    </Section>
                );
            })}
        </div>
    );
}
