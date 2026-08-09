import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireStaffSession } from "@/lib/auth/requireStaffSession";

// GET /api/admin/subscribers
export async function GET() {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        const { data: requests, error: reqError } = await supabaseAdmin
            .from("subscription_requests")
            .select("*")
            .order("created_at", { ascending: false });

        if (reqError) throw reqError;

        if (!requests || requests.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const userIds = Array.from(new Set(requests.map((r) => r.user_id)));
        const { data: profiles, error: profError } = await supabaseAdmin
            .from("profiles")
            .select("id, email, full_name, phone, role, created_at")
            .in("id", userIds);

        if (profError) throw profError;

        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

        const data = requests.map((req) => ({
            ...req,
            profiles: profileMap.get(req.user_id) || null,
        }));

        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch subscriber requests";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// PATCH /api/admin/subscribers
export async function PATCH(request: Request) {
    const check = await requireStaffSession();
    if (check.error) return check.error;

    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body payload" }, { status: 400 });
        }

        const { requestId, status } = body;

        if (!requestId || !["accepted", "rejected"].includes(status)) {
            return NextResponse.json({ error: "Invalid payload or status" }, { status: 400 });
        }

        const { data: subReq, error: reqError } = await supabaseAdmin
            .from("subscription_requests")
            .update({ status })
            .eq("id", requestId)
            .select()
            .single();

        if (reqError) throw reqError;

        if (status === "accepted") {
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);

            const { error: subError } = await supabaseAdmin.from("subscriptions").insert({
                user_id: subReq.user_id,
                status: "active",
                expires_at: expiresAt.toISOString(),
            });

            if (subError) throw subError;

            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .update({ role: "subscriber" })
                .eq("id", subReq.user_id);

            if (profileError) throw profileError;
        }

        return NextResponse.json({ success: true, data: subReq });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update subscription request";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}