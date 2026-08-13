import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/supabase";

// GET all policies for admin view
export async function GET() {
    const { data, error } = await supabase
        .from("policies")
        .select("*")
        .order("slug", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PUT(req: Request) {
    try {
        const { id, slug, title, content, is_published } = await req.json();

        if (!slug) {
            return NextResponse.json({ error: "Slug is required" }, { status: 400 });
        }

        // Use upsert on 'slug' so it inserts if missing, or updates if present
        const { data, error } = await supabase
            .from("policies")
            .upsert(
                {
                    ...(id ? { id } : {}), // Keep existing ID if present
                    slug,
                    title,
                    content,
                    is_published,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "slug" } // Match on unique 'slug'
            )
            .select()
            .maybeSingle();

        if (error) {
            console.error("Supabase PUT Error:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (err: unknown) {
        console.error("API Error:", err);
        return NextResponse.json({ error: "Failed to update policy" }, { status: 500 });
    }
}