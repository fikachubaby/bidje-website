import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "All";

        const offset = (page - 1) * limit;

        let query = supabase
            .from("financing_consultants")
            .select("*", { count: "exact" });

        if (search.trim()) {
            query = query.ilike("name", `%${search.trim()}%`);
        }

        if (status === "Active") {
            query = query.eq("is_active", true);
        } else if (status === "Inactive") {
            query = query.eq("is_active", false);
        }

        query = query
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        const { data: consultants, error, count } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const totalCount = count || 0;
        const totalPages = Math.ceil(totalCount / limit) || 1;

        return NextResponse.json({
            consultants: consultants || [],
            totalCount,
            totalPages,
            page,
        });
    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, is_active } = body;

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Consultant name is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("financing_consultants")
            .insert([
                {
                    name: name.trim(),
                    is_active: is_active ?? true,
                },
            ])
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "A financing consultant with this name already exists." },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ consultant: data }, { status: 201 });
    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, name, is_active } = body;

        if (!id) {
            return NextResponse.json(
                { error: "Consultant ID is required" },
                { status: 400 }
            );
        }

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "Consultant name is required" },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from("financing_consultants")
            .update({
                name: name.trim(),
                is_active: is_active ?? true,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return NextResponse.json(
                    { error: "A financing consultant with this name already exists." },
                    { status: 400 }
                );
            }
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ consultant: data }, { status: 200 });
    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Consultant ID is required" },
                { status: 400 }
            );
        }

        const { error } = await supabase
            .from("financing_consultants")
            .delete()
            .eq("id", id);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err: unknown) {
        const errorMessage =
            err instanceof Error ? err.message : "Internal Server Error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}