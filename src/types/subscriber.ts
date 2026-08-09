export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type RequestStatus = 'pending' | 'accepted' | 'rejected';
export type RequestType = 'new' | 'renew';

export interface SubscriberProfile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    role: 'visitor' | 'subscriber' | 'staff' | 'admin';
    created_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    status: SubscriptionStatus;
    started_at: string;
    expires_at: string;
    auto_renew: boolean;
    created_at: string;
}

export interface SubscriptionRequest {
    id: string;
    user_id: string;
    request_type: RequestType;
    status: RequestStatus;
    amount_paid: number | null;
    proof_of_payment_url: string | null;
    created_at: string;
    profiles?: SubscriberProfile;
}