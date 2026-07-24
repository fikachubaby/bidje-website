import { steps } from "./data";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl bg-black p-8 text-white sm:p-12">
        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#ffd400]">
          Simple and structured
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          How Bidje Works
        </h2>

        <p className="mt-4 max-w-3xl leading-7 text-white/65">
          Buyers submit qualified offers through Bidje. Buyers are responsible
          for arranging their own financing and loan approval.
        </p>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number}>
              <span className="text-sm font-black text-[#ffd400]">
                {step.number}
              </span>

              <h3 className="mt-3 text-lg font-black">{step.title}</h3>

              <p className="mt-2 text-sm leading-6 text-white/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm leading-6 text-white/70">
          The full commitment-fee, withdrawal and refund terms will be shown
          to the buyer before payment is made.
        </div>
      </div>
    </section>
  );
}
