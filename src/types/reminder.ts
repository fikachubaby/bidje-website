export type ReminderChannel = "whatsapp" | "email" | "both";
export type ReminderStatus = "scheduled" | "sent" | "cancelled";

export interface Reminder {
    id: string;
    propertyId: string;
    investorId: string;
    offerId?: string | null;
    title: string;
    description?: string | null;
    dueDate: string; // ISO date
    channel: ReminderChannel;
    remindDaysBefore: number[];
    status: ReminderStatus;
    lastSentAt?: string | null;
    createdBy?: string | null;
    createdAt: string;
    // joined fields (from API response)
    propertyTitle?: string;
    investorName?: string;
    investorEmail?: string;
    investorPhone?: string;
}

export interface ReminderFormInput {
    propertyId: string;
    investorId: string;
    offerId?: string;
    title: string;
    description?: string;
    dueDate: string;
    channel: ReminderChannel;
    remindDaysBefore: number[];
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
