export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
        <div>
          <p className="text-2xl font-black tracking-[-0.04em]">BIDJE</p>
          <p className="mt-1 text-sm text-neutral-500">
            A happier way to find your next property.
          </p>
        </div>

        <p className="text-sm text-neutral-500">
          © 2026 Bidje. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
