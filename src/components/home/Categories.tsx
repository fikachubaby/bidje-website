import Link from "next/link";
import { categories } from "./data";

export default function Categories() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <p className="text-sm font-black uppercase tracking-[0.22em] text-[#9c7c00]">
        Find your opportunity
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
        Browse by Category
      </h2>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.title}
              href={category.href}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-black hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#ffd400]">
                <Icon className="h-7 w-7" />
              </div>

              <h3 className="mt-5 text-lg font-black group-hover:underline">
                {category.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {category.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
