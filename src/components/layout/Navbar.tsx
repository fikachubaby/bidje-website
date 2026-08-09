"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, User, ChevronDown, Menu, X, MapPin, PlusCircle, ShieldCheck } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter } from "next/navigation";
import { translate as t } from "@/lib/i18n/getTranslation";

const FEATURED_LOCATIONS = [
  { name: "Kuala Lumpur", slug: "kuala-lumpur" },
  { name: "Selangor", slug: "selangor" },
  { name: "Perak", slug: "perak" },
  { name: "Melaka", slug: "melaka" },
  { name: "Negeri Sembilan", slug: "negeri-sembilan" },
];

export function Navbar() {
  const { user, loading } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        {/* Brand Logo & Tagline */}
        <Link href="/" className="flex items-center gap-4" aria-label="Bidje Homepage">
          <span className="text-[34px] font-black leading-none tracking-[-0.05em] text-[#ffd400]">
            BIDJE
          </span>
          <span className="hidden border-l border-white/25 pl-4 text-[9px] font-extrabold uppercase leading-[1.35] tracking-wide text-white/70 sm:block">
            {t("Main.heading1")}<br />{t("Main.heading2")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 text-sm font-bold lg:flex" aria-label="Main Navigation">
          <Link href="/properties" className="hover:text-[#ffd400] transition-colors">
            {t("Properties.search.browse")}
          </Link>

          {/* pSEO Location Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLocationDropdownOpen(true)}
            onMouseLeave={() => setLocationDropdownOpen(false)}
          >
            <button
              className="flex items-center gap-1 hover:text-[#ffd400] transition-colors py-2"
              aria-expanded={locationDropdownOpen}
              aria-haspopup="true"
            >
              <span>{t("Properties.fields.locations")}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {locationDropdownOpen && (
              <div className="absolute left-0 top-full w-56 rounded-xl border-2 border-black bg-white p-2 text-black shadow-[4px_4px_0_0_#000] transition-all">
                <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-neutral-400">
                  {t("Properties.fields.targetLocation")}
                </div>
                {FEATURED_LOCATIONS.map((loc) => (
                  <Link
                    key={loc.slug}
                    href={`/properties/location/${loc.slug}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#ffd400]"
                    onClick={() => setLocationDropdownOpen(false)}
                  >
                    <MapPin className="h-3.5 w-3.5 text-neutral-600" />
                    {loc.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Valuation & Trust link */}
          <Link href="/about-score" className="flex items-center gap-1.5 hover:text-[#ffd400] transition-colors">
            <ShieldCheck className="h-4 w-4 text-[#ffd400]" />
            <span>{t("Main.menu.menu1")}</span>
          </Link>

          <Link href="/#how-it-works" className="hover:text-[#ffd400] transition-colors">{t("Main.menu.menu2")}</Link>

          {/* Seller CTA */}
          <Link
            href="/list-property"
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-2 text-xs font-black text-black transition hover:bg-[#ffe24b]"
          >
            <PlusCircle className="h-4 w-4" />
            {t("Main.menu.menu3")}
          </Link>
        </nav>

        {/* Auth / Right Actions */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="hidden items-center gap-4 text-sm font-bold md:flex">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#ffd400]" />
                {user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 hover:text-[#ffd400] transition-colors"
                aria-label="Log out of account"
              >
                <LogOut className="h-4 w-4" />
                {t("Authentication.logout")}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden text-sm font-bold hover:text-[#ffd400] transition-colors md:block"
            >
                {t("Authentication.signIn")}
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-black px-6 py-6 lg:hidden">
          <nav className="flex flex-col gap-4 text-base font-bold">
            <Link
              href="/properties"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-[#ffd400]"
            >
              {t("Properties.search.browse")}
            </Link>

            <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
              <span className="text-xs font-black uppercase text-white/50 tracking-wider">
                {t("Properties.fields.locations")}
              </span>
              {FEATURED_LOCATIONS.map((loc) => (
                <Link
                  key={loc.slug}
                  href={`/properties/location/${loc.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-sm text-neutral-300 hover:text-[#ffd400]"
                >
                  <MapPin className="h-4 w-4 text-[#ffd400]" />
                  {loc.name}
                </Link>
              ))}
            </div>

            <Link
              href="/about-score"
              onClick={() => setMobileMenuOpen(false)}
              className="pt-2 border-t border-white/10 hover:text-[#ffd400] flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4 text-[#ffd400]" />
              {t("Main.menu.menu1")}
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="pt-2 border-t border-white/10 hover:text-[#ffd400]"
            >
              {t("Main.menu.menu2")}
            </Link>

            <Link
              href="/list-property"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-center text-sm font-black text-black"
            >
              <PlusCircle className="h-4 w-4" />
              {t("Main.menu.menu3")}
            </Link>

            {!loading && user ? (
              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-bold">
                <span className="flex items-center gap-2 text-neutral-300">
                  <User className="h-4 w-4 text-[#ffd400]" />
                  {user.email?.split("@")[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  {t("Authentication.logout")}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 border-t border-white/10 pt-4 hover:text-[#ffd400]"
              >
                  {t("Authentication.signIn")}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}