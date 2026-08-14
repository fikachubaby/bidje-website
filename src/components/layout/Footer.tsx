import Link from "next/link";
import { Facebook, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

const footerLinks = {
  explore: [
    { href: "/properties?category=land", label: "Land" },
    { href: "/properties?category=landed", label: "Landed" },
    { href: "/properties?category=high-rise", label: "High Rise" },
    { href: "/properties?category=commercial", label: "Commercial" },
    { href: "/properties?category=auction", label: "Auction" },
  ],
  legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

interface FooterProps {
  isAdmin?: boolean;
}

export function Footer({ isAdmin = false }: FooterProps) {
  if (isAdmin) {
    return (
      <footer className="border-t border-white/10 bg-neutral-950 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-neutral-400">
            &copy; {new Date().getFullYear()} Bidje. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-neutral-200 bg-neutral-950 text-neutral-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.8fr_1fr_1.15fr] lg:gap-x-14 xl:gap-x-20">
          <div>
            <Logo variant="dark" />
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
              Managed By
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              YSBRNV Consultant and Management Sdn. Bhd.
            </p>

            <h3 className="mt-7 text-sm font-semibold uppercase tracking-wider text-white">
              Legal Consultants
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="text-sm text-neutral-400">Rastam, Singa &amp; Co.</li>
              <li className="text-sm text-neutral-400">Zurina, Anum &amp; Co.</li>
              <li className="text-sm text-neutral-400">Wan &amp; Redzuan</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-3 text-sm text-neutral-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <span className="block">87-1 Jalan S2 B19</span>
                  <span className="block">Pusat Dagangan Seremban 2</span>
                  <span className="block">70300 Seremban</span>
                  <span className="block">Negeri Sembilan</span>
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-neutral-400">
                <Mail className="h-4 w-4 shrink-0 text-brand" />
                <a
                  href="mailto:admin@bidje.com"
                  className="transition-colors hover:text-brand"
                >
                  admin@bidje.com
                </a>
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