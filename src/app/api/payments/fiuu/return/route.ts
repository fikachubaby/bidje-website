import { NextResponse } from "next/server";

/**
 * Fiuu sends the shopper back with a browser POST. Pages can't take POSTs, so bounce to the
 * dashboard with a GET. Status is never trusted from here — only the signed callback updates it.
 */
async function bounce(req: Request) {
    let status: string | null = null;
    try {
        status = String((await req.formData()).get("status") ?? "");
    } catch {
        status = new URL(req.url).searchParams.get("status");
    }
    const url = new URL("/dashboard", req.url);
    url.searchParams.set("tab", "billing");
    url.searchParams.set("payment", status === "00" ? "success" : status === "22" ? "pending" : "failed");
    return NextResponse.redirect(url, 303);
}

export { bounce as GET, bounce as POST };
