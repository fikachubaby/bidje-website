import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "light" | "dark";
}

export function Logo({ className, variant = "light" }: LogoProps) {
  const isDark = variant === "dark";

  return (
    <Link href="/" className={cn("group flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold shadow-[2px_2px_0_0_#000]",
          isDark
            ? "border-brand bg-gold text-white"
            : "border-black bg-gold text-white"
        )}
        aria-hidden="true"
      >
        B
      </span>
      <span
        className={cn(
          "font-serif text-xl font-bold tracking-tight",
          isDark ? "text-white" : "text-black"
        )}
      >
        BIDJE
        <span
          className={cn(
            "font-sans text-base font-semibold",
            isDark ? "text-neutral-300" : "text-black"
          )}
        >
          .com
        </span>
      </span>
    </Link>
  );
}
