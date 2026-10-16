/** The single subscriber plan. Change price here; checkout, renewals and UI all read it. */
export const SUBSCRIBER_PLAN = {
    code: "monthly",
    name: "Subscriber Pass",
    description: "Direct owner access, full addresses and property alerts",
    price: 2,
    currency: "MYR",
    intervalMonths: 1,
} as const;

/** Days a failed auto-renewal keeps access while we retry. */
export const RENEWAL_GRACE_DAYS = 3;

export type SubscriptionStatus = "active" | "past_due" | "expired" | "cancelled";

export interface SubscriptionView {
    status: SubscriptionStatus | "none";
    planName: string;
    price: number;
    currentPeriodEnd: string | null;
    autoRenew: boolean;
    cancelAtPeriodEnd: boolean;
    cardLabel: string | null;
    hasSavedCard: boolean;
}

export interface BillingPayment {
    id: string;
    amount: number;
    status: string;
    paidAt: string | null;
    createdAt: string;
    channel: string | null;
}

export function addMonths(from: Date, months: number) {
    const d = new Date(from);
    d.setMonth(d.getMonth() + months);
    return d;
}
