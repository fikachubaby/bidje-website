export type ReminderChannel = "whatsapp" | "email" | "both";
export type ReminderStatus = "scheduled" | "sent" | "cancelled";
export type ReminderRepeat = "day" | "week" | "month";

/** Someone besides the investor who also gets the reminder. */
export interface ReminderRecipient {
    role: string;
    name: string;
    phone?: string;
    email?: string;
}

export interface Reminder {
    id: string;
    propertyId?: string | null;
    investorPropertyId?: string | null;
    investorId: string;
    offerId?: string | null;
    title: string;
    description?: string | null;
    dueDate: string; // ISO date
    channel: ReminderChannel;
    remindDaysBefore: number[];
    repeatEvery?: ReminderRepeat | null;
    recipients?: ReminderRecipient[];
    status: ReminderStatus;
    lastSentAt?: string | null;
    createdBy?: string | null;
    createdAt: string;
    propertyTitle?: string;
    investorName?: string;
    investorEmail?: string;
    investorPhone?: string;
}

export interface ReminderFormInput {
    propertyId?: string;
    investorPropertyId?: string;
    investorId: string;
    offerId?: string;
    title: string;
    description?: string;
    dueDate: string;
    channel: ReminderChannel;
    remindDaysBefore: number[];
    /** Repeat until the due date; omit to use remindDaysBefore only. */
    repeatEvery?: ReminderRepeat;
    recipients?: ReminderRecipient[];
    /** Also notify the investor immediately on the chosen channel(s). */
    sendNow?: boolean;
}

export interface ReminderPropertyOption {
    id: string;
    name: string;
    district?: string;
    state?: string;
}

export interface ReminderOfferOption {
    id: string;
    propertyId: string;
    buyerName?: string;
    status: string;
}
