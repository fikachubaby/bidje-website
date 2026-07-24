interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-bold text-neutral-500">{label}</p>
      <p className="mt-3 text-4xl font-black text-neutral-900">{value}</p>
    </article>
  );
}
