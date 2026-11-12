export const REMINDER_DAY_PRESETS = [
    { label: "7 days before", value: 7 },
    { label: "3 days before", value: 3 },
    { label: "On due date", value: 0 },
] as const;

export function formatDueIn(dueDate: string): string {
    const days = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return `Overdue by ${Math.abs(days)}d`;
    if (days === 0) return "Due today";
    return `Due in ${days}d`;
}
export const REMINDER_REPEAT_OPTIONS = [
    { value: "day", label: "Every day" },
    { value: "week", label: "Every week" },
    { value: "month", label: "Every month" },
] as const;

export const MAX_REMINDER_RECIPIENTS = 5;

const clean = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Keeps up to 5 recipients that have a phone or an email. */
export function sanitizeRecipients(value: unknown): { role: string; name: string; phone?: string; email?: string }[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((r) => ({
            role: clean(r?.role, 60),
            name: clean(r?.name),
            phone: clean(r?.phone, 40) || undefined,
            email: clean(r?.email) || undefined,
        }))
        .filter((r) => r.phone || r.email)
        .slice(0, MAX_REMINDER_RECIPIENTS);
}

export function isReminderRepeat(v: unknown): v is "day" | "week" | "month" {
    return v === "day" || v === "week" || v === "month";
}

export interface DeliveryResult {
    channel: "whatsapp" | "email";
    /** Who it went to; missing means the investor. */
    to?: string;
    ok: boolean;
    error?: string;
}

const CHANNEL_LABEL = { whatsapp: "WhatsApp", email: "Email" } as const;

/** One toast per channel, so admins see exactly what reached the investor and why anything failed. */
export async function toastDeliveryResults(results: DeliveryResult[] = []) {
    const { toast } = await import("sonner");
    for (const r of results) {
        const to = r.to ?? "investor";
        if (r.ok) toast.success(`${CHANNEL_LABEL[r.channel]} sent to ${to}`);
        else toast.error(`${CHANNEL_LABEL[r.channel]} to ${to} failed: ${r.error ?? "unknown error"}`);
    }
}
