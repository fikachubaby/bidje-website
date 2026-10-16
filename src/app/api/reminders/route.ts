import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

export async function GET() {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const { data, error } = await supabaseAdmin
        .from("reminders")
        .select(`
      *,
      profiles!reminders_investor_id_fkey (full_name, email, phone),
      properties (title),
      investor_properties (address)
    `)
        .order("due_date", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const mapped = (data ?? []).map((r) => ({
        id: r.id,
        propertyId: r.property_id,
        investorPropertyId: r.investor_property_id,
        investorId: r.investor_id,
        offerId: r.offer_id,
        title: r.title,
        description: r.description,
        dueDate: r.due_date,
        channel: r.channel,
        remindDaysBefore: r.remind_days_before,
        status: r.status,
        lastSentAt: r.last_sent_at,
        createdAt: r.created_at,
        propertyTitle: r.properties?.title ?? r.investor_properties?.address,
        investorName: r.profiles?.full_name,
        investorEmail: r.profiles?.email,
        investorPhone: r.profiles?.phone,
    }));

    return NextResponse.json({ reminders: mapped });
}

export async function POST(req: Request) {
    const session = await requireStaffSession();
    if (session.error) return session.error;
    const body = await req.json();

    const { data, error } = await supabaseAdmin
        .from("reminders")
        .insert({
            property_id: body.propertyId || null,
            investor_property_id: body.investorPropertyId || null,
            investor_id: body.investorId,
            offer_id: body.offerId || null,
            title: body.title,
            description: body.description || null,
            due_date: body.dueDate,
            channel: body.channel,
            remind_days_before: body.remindDaysBefore,
            created_by: body.createdBy || null,
        })
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reminder: data }, { status: 201 });
}