import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";

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

        if (supabaseAdmin) {
            const { error: dbError } = await supabaseAdmin
                .from("property_requests")
                .insert([
                    {
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