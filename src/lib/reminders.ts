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
export interface DeliveryResult {
    channel: "whatsapp" | "email";
    ok: boolean;
    error?: string;
}

const CHANNEL_LABEL = { whatsapp: "WhatsApp", email: "Email" } as const;

/** One toast per channel, so admins see exactly what reached the investor and why anything failed. */
export async function toastDeliveryResults(results: DeliveryResult[] = []) {
    const { toast } = await import("sonner");
    for (const r of results) {
        if (r.ok) toast.success(`${CHANNEL_LABEL[r.channel]} sent to investor`);
        else toast.error(`${CHANNEL_LABEL[r.channel]} failed: ${r.error ?? "unknown error"}`);
    }
}
