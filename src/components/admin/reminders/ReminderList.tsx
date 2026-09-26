"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase";
import { RemindersView } from "@/components/admin/reminders/RemindersView";
import type { AdminProperty } from "@/types/property";
import type { BuyerOffer } from "@/types/offer";

export default function AdminRemindersPage() {
    const [properties, setProperties] = useState<AdminProperty[]>([]);
    const [offers, setOffers] = useState<BuyerOffer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [{ data: propertiesData }, { data: offersData }] = await Promise.all([
                    supabase.from("properties").select("id, title, district, state").order("title"),
                    supabase.from("offers").select("id, property_id, status").order("submitted_at", { ascending: false }),
                ]);

                setProperties(
                    (propertiesData ?? []).map((p) => ({
                        id: p.id,
                        name: p.title,
                        district: p.district,
                        state: p.state,
                    })) as AdminProperty[]
                );

                setOffers(
                    (offersData ?? []).map((o) => ({
                        id: o.id,
                        propertyId: o.property_id,
                        status: o.status,
                    })) as BuyerOffer[]
                );
            } catch (err) {
                console.error("Failed to load reminders page data:", err);
            } finally {
                setLoading(false);
            }
        }

        void loadData();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-neutral-900">Reminders</h1>
                <p className="mt-1 text-sm text-neutral-500">
                    Manage legal, renovation, and follow-up deadlines across all properties and offers.
                </p>
            </div>

            {loading ? (
                <p className="py-12 text-center text-sm text-neutral-500">Loading...</p>
            ) : (
                <RemindersView properties={properties} offers={offers} />
            )}
        </div>
    );
}