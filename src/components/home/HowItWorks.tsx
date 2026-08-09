import { ShieldCheck, Search, FileText, CheckCircle2 } from "lucide-react";
import { translate as t } from "@/lib/i18n/getTranslation";

interface StepItem {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: StepItem[] = [
  {
    number: "01",
    title: "Subscribe & Unlock Access",
    description: "Join our secure platform for just RM 2/month to access exclusive, off-market, and direct-owner property listings across Malaysia.",
    icon: ShieldCheck,
  },
  {
    number: "02",
    title: "Browse Off-Market Properties",
    description: "Explore verified luxury service suites, terrace houses, and commercial assets vetted specifically for serious buyers and investors.",
    icon: Search,
  },
  {
    number: "03",
    title: "Submit Qualified Offer & Docs",
    description: "Submit your official purchase or rental bid. Securely upload your IC copy and the RM 500 offer processing fee receipt instantly.",
    icon: FileText,
  },
  {
    number: "04",
    title: "Track Status & Close",
    description: "Monitor your offer history log (Pending, Accepted, or Rejected) in real-time and coordinate directly with property owners.",
    icon: CheckCircle2,
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-label="How Bidje Works - Malaysian Property Marketplace"
      className="mx-auto max-w-7xl px-6 py-16"
    >
      <div className="rounded-3xl bg-black p-8 text-white sm:p-12 shadow-xl">
        {/* SEO Header context */}
        <header>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd400]">
            {t("HowItWorks.title")}
          </p>

          <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-white">{t("HowItWorks.heading1")}</h2>

          <p className="mt-4 max-w-3xl leading-relaxed text-white/70 text-sm sm:text-base">
            {t("HowItWorks.info")}
          </p>
        </header>

        {/* Steps Grid optimized for Mobile and Fast Loading */}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => {
            const IconComponent = step.icon;
            return (
              <article
                key={step.number}
                className="flex flex-col justify-between rounded-2xl bg-white/5 p-6 border border-white/10 transition-all hover:border-[#ffd400]/50"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider text-[#ffd400] bg-[#ffd400]/10 px-3 py-1 rounded-full border border-[#ffd400]/20">
                      Step {step.number}
                    </span>
                    <div className="rounded-xl bg-white/10 p-2 text-[#ffd400]">
                      <IconComponent className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>

                  <p className="mt-2 text-sm leading-relaxed text-white/65">
                    {step.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* Informational Callout Box */}
        <aside className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-6 text-white/80">
          <p>
            <strong className="text-white">{t("HowItWorks.terms1")}</strong> {t("HowItWorks.terms2")}
          </p>
        </aside>
      </div>
    </section>
  );
}