"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "Why BIDJE" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-black bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <ul className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-sm font-semibold text-black transition-colors hover:text-neutral-700"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-black transition-colors hover:text-neutral-700"
          >
            Sign in
          </Link>
          <Link
            href="/list-property"
            className="rounded-full border-2 border-black bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            List your property
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border-2 border-black p-2 text-black md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <div
        className={cn(
          "overflow-hidden border-t-2 border-black bg-white transition-all duration-300 md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="flex flex-col gap-1 px-4 py-4">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-black hover:bg-brand-muted"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/login"
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-black hover:bg-brand-muted"
              onClick={() => setMobileOpen(false)}
            >
              Sign in
            </Link>
          </li>
          <li className="mt-2 border-t border-neutral-200 pt-3">
            <Link
              href="/list-property"
              className="block rounded-full border-2 border-black bg-black px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-neutral-800"
              onClick={() => setMobileOpen(false)}
            >
              List your property
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
