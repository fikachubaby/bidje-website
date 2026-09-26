import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.dueDate !== undefined) updates.due_date = body.dueDate;
    if (body.channel !== undefined) updates.channel = body.channel;
    if (body.remindDaysBefore !== undefined) updates.remind_days_before = body.remindDaysBefore;
    if (body.status !== undefined) updates.status = body.status;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin.from("reminders").update(updates).eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const { error } = await supabaseAdmin.from("reminders").delete().eq("id", id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}