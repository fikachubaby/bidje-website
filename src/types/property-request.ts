export type PropertyRequestStatus = "pending" | "contacted" | "approved" | "rejected";

export interface PropertyRequest {
    id: string;
    full_name: string;
    property_address: string;
    expected_price: string;
    phone_number: string;
    status: PropertyRequestStatus;
    created_at: string;
}