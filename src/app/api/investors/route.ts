import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone")
        .eq("role", "subscriber")
        .order("full_name", { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ investors: data ?? [] });
}