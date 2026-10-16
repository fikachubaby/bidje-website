"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

/** Navbar bell for investors: rings while they have upcoming deadlines, opens their portfolio. */
export function ReminderBell({ className }: { className?: string }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        fetch("/api/investor/reminders")
            .then((res) => (res.ok ? res.json() : { upcoming: 0 }))
            .then((data) => setCount(data.upcoming ?? 0))
            .catch(() => setCount(0));
    }, []);

    return (
        <Link
            href="/investor"
            aria-label={count ? `${count} upcoming deadlines` : "No upcoming deadlines"}
            className={cn("relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/10", className)}
        >
            <Bell className={cn("h-5 w-5 origin-top text-[#ffd400]", count > 0 && "animate-bell-ring")} />
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    );
}
