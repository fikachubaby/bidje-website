import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const footerLinks = {
  explore: [
    { href: "/properties?category=land", label: "Land" },
    { href: "/properties?category=landed", label: "Landed" },
    { href: "/properties?category=high-rise", label: "High Rise" },
    { href: "/properties?category=commercial", label: "Commercial" },
    { href: "/properties?category=auction", label: "Auction" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/careers", label: "Careers" },
    { href: "/blog", label: "Blog" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                B
              </span>
              <span className="text-xl font-bold text-white">Bidje</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              Malaysia&apos;s modern property marketplace. Find your dream home,
              land, or commercial space with confidence.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://facebook.com"
                aria-label="Facebook"
                className="text-neutral-400 transition-colors hover:text-brand"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                aria-label="Instagram"
                className="text-neutral-400 transition-colors hover:text-brand"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                aria-label="LinkedIn"
                className="text-neutral-400 transition-colors hover:text-brand"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                Kuala Lumpur, Malaysia
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400">
                <Phone className="h-4 w-4 shrink-0 text-brand" />
                +60 3-1234 5678
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                hello@bidje.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-8 sm:flex-row">
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Bidje. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-neutral-500 transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
