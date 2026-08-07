"use client";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";
import { supabase } from "@/lib/supabase/supabase";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, loading } = useSession();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black text-white">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-4">
          <span className="text-[34px] font-black leading-none tracking-[-0.05em] text-[#ffd400]">BIDJE</span>
          <span className="hidden border-l border-white/25 pl-4 text-[9px] font-extrabold uppercase leading-[1.35] tracking-wide text-white/70 sm:block">A happier way to find<br />your next property</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-bold lg:flex">
          <Link href="/properties" className="hover:text-[#ffd400]">Properties</Link>
          <Link href="#how-it-works" className="hover:text-[#ffd400]">How Bidje Works</Link>
        </nav>
        <div className="flex items-center gap-3">
          {/* <Link href="/saved" className="hidden items-center gap-2 text-sm font-bold sm:flex"><Heart className="h-5 w-5" />Saved</Link> */}
          {!loading && user ? (
            <>
              <span className="hidden items-center gap-2 text-sm font-bold md:flex">
                <User className="h-4 w-4" />
                {user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="hidden items-center gap-2 text-sm font-bold hover:text-[#ffd400] md:flex"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="hidden text-sm font-bold hover:text-[#ffd400] md:block">
              Sign In
            </Link>
          )}

          {/* <Link href="/admin" className="hidden text-sm font-bold md:block">Staff Sign In</Link> */}
          <Link href="/list-property" className="rounded-xl border-2 border-[#ffd400] bg-[#ffd400] px-4 py-3 text-sm font-black text-black transition hover:bg-[#ffe24b]">List Property</Link>
        </div>
      </div>
    </header>
  );
}