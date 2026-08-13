import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

// GET all advertisements
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("advertisements")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// POST create a new advertisement
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { data, error } = await supabaseAdmin
            .from("advertisements")
            .insert([body])
            .select();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data[0]);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}