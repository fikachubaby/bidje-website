// import { statistics } from "./data";

export default function Statistics() {
  return (
    <section className="bg-gradient-to-r from-black via-neutral-950 to-black pt-28 text-white">
      <div className="mx-auto grid max-w-7xl divide-y divide-white/10 px-6 py-8 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {/* {statistics.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 px-5 py-5 lg:justify-center"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#ffd400] text-xl font-black text-[#ffd400]">
              ✓
            </span>

            <div>
              <p className="text-2xl font-black">{stat.value}</p>
              <p className="mt-1 text-sm text-white/60">{stat.label}</p>
            </div>
          </div>
        ))} */}
      </div>
    </section>
  );
}
