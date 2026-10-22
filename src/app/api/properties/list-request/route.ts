import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { requireUserSession } from "@/lib/auth/requireUserSession";

/** The signed-in seller's own listing requests, newest first. */
export async function GET() {
    const session = await requireUserSession();
    if (session.error) return session.error;

    const { data, error } = await supabaseAdmin
        .from("property_requests")
        .select("id, property_address, expected_price, status, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ requests: data ?? [] });
}

interface ListPropertyPayload {
    name: string;
    address: string;
    expectedPrice: string;
    phone: string;
}

export async function POST(request: Request) {
    try {
        const body: ListPropertyPayload = await request.json();
        const { name, address, expectedPrice, phone } = body;

        if (!name || !address || !expectedPrice || !phone) {
            return NextResponse.json(
                { error: "All fields are required." },
                { status: 400 }
            );
        }

        // Guests can still submit; signed-in sellers get the request linked to their account.
        const session = await requireUserSession();
        const userId = session.error ? null : session.user.id;

        if (supabaseAdmin) {
            const { error: dbError } = await supabaseAdmin
                .from("property_requests")
                .insert([
                    {
                        user_id: userId,
                        full_name: name,
                        property_address: address,
                        expected_price: `RM ${expectedPrice}`,
                        phone_number: phone,
                        status: "pending",
                        created_at: new Date().toISOString(),
                    },
                ]);

            if (dbError) {
                console.warn("DB insertion warning:", dbError.message);
            }
        }

        const formattedPrice = expectedPrice.startsWith("RM") ? expectedPrice : `RM ${expectedPrice}`;
        const targetAdminEmail = "admin@bidje.com";
        const targetWhatsappPhone = "+60137098606";

        // 3. Optional: WhatsApp API integration hook (e.g. Fiuu / Twilio / Green API)
        // Send alert to +60137098606
        console.log(`[WhatsApp Alert Queued -> ${targetWhatsappPhone}]: New submission from ${name} (${phone}) for ${formattedPrice}`);

        // 4. Optional: Email API integration hook (e.g. Resend / SendGrid / Nodemailer)
        // Send alert to admin@bidje.com
        console.log(`[Email Notification Queued -> ${targetAdminEmail}]: New submission from ${name}`);

        return NextResponse.json({
            success: true,
            message: "Property listing request submitted successfully.",
        });
    } catch (error) {
        console.error("Error processing property list request:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}