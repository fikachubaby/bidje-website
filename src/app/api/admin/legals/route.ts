import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "All";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = 10;
        const offset = (page - 1) * limit;

        let query = supabase
            .from("legal_firms")
            .select("*", { count: "exact" });

        if (search.trim()) {
            query = query.ilike("name", `%${search.trim()}%`);
        }

        if (status === "Active") {
            query = query.eq("is_active", true);
        } else if (status === "Inactive") {
            query = query.eq("is_active", false);
        }

        const { data, count, error } = await query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            firms: data,
            totalCount,
            totalPages,
        });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, contactPerson, email, phone, address, isActive } = body;

        if (!name) {
            return NextResponse.json({ error: "Firm name is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("legal_firms")
            .insert([
                {
                    name,
                    contact_person: contactPerson || null,
                    email: email || null,
                    phone: phone || null,
                    address: address || null,
                    is_active: isActive ?? true,
                },
            ])
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, contactPerson, email, phone, address, isActive } = body;

        if (!id || !name) {
            return NextResponse.json({ error: "Firm ID and name are required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("legal_firms")
            .update({
                name,
                contact_person: contactPerson || null,
                email: email || null,
                phone: phone || null,
                address: address || null,
                is_active: isActive ?? true,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        // Explicitly return JSON data
        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Firm ID is required" }, { status: 400 });
        }

        const { error } = await supabase
            .from("legal_firms")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}