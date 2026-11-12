import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabase-admin";
import { deliverReminder } from "@/lib/reminders-server/deliverReminder";

/** Today's date in Malaysia as YYYY-MM-DD. */
function todayMY() {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date());
}

function daysBetween(fromIso: string, toIso: string) {
    return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);
}

const myDate = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date(iso));

/** Repeating reminders go out every day / week / month until (and on) the due date. */
function repeatIsDue(repeat: string | null, lastSentAt: string | null, today: string, dueDate: string) {
    if (!repeat || today > dueDate) return false;
    if (!lastSentAt) return true;
    const next = new Date(`${myDate(lastSentAt)}T00:00:00Z`);
    if (repeat === "day") next.setUTCDate(next.getUTCDate() + 1);
    else if (repeat === "week") next.setUTCDate(next.getUTCDate() + 7);
    else if (repeat === "month") next.setUTCMonth(next.getUTCMonth() + 1);
    else return false;
    return next.toISOString().slice(0, 10) <= today;
}

export async function GET(req: Request) {
    if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: reminders, error } = await supabaseAdmin
        .from("reminders")
        .select("id, due_date, remind_days_before, repeat_every, last_sent_at")
        .eq("status", "scheduled");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const today = todayMY();
    const due = (reminders ?? []).filter((r) => {
        const alreadySentToday =
            r.last_sent_at &&
            new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(new Date(r.last_sent_at)) === today;
        if (alreadySentToday) return false;
        if ((r.remind_days_before ?? []).includes(daysBetween(today, r.due_date))) return true;
        return repeatIsDue(r.repeat_every, r.last_sent_at, today, r.due_date);
    });

    let sent = 0;
    for (const r of due) {
        const { results } = await deliverReminder(r.id);
        if (results.some((x) => x.ok)) sent++;
    }

    return NextResponse.json({ success: true, checked: reminders?.length ?? 0, due: due.length, sent });
}
