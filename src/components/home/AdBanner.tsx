import Link from "next/link";
import type { Advertisement } from "@/types/ad";

/** Admin-managed campaign banner (Advertisement Manager). */
export function AdBanner({ ad }: { ad: Advertisement }) {
    const isExternal = ad.target_url?.startsWith("http");

    return (
        <section className="w-full bg-black px-4 py-12 sm:px-6 lg:px-8">
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-[#ffcc00]/30 shadow-2xl">
                {ad.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element -- admin uploads may be data URLs or any host
                    <img src={ad.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className="relative flex min-h-[220px] flex-col items-start justify-end gap-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-10">
                    <h2 className="max-w-2xl text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{ad.title}</h2>
                    {ad.target_url && (
                        <Link
                            href={ad.target_url}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="rounded-xl bg-[#ffcc00] px-5 py-3 text-sm font-black text-black transition hover:bg-[#ffe24b]"
                        >
                            {ad.cta_text || "Learn More"}
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
