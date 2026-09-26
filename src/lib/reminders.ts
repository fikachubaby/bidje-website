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