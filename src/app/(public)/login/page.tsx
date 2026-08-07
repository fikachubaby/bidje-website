import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { VisitorLoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20 sm:px-6">
                <h1 className="text-3xl font-black tracking-tight text-black">Sign in</h1>
                <p className="mt-2 text-sm font-medium text-black/60">
                    Welcome back. Sign in to manage your offers.
                </p>
                <div className="mt-8">
                    <Suspense fallback={null}>
                        <VisitorLoginForm />
                    </Suspense>
                </div>
                <p className="mt-6 text-sm font-medium text-black/60">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-bold text-black underline decoration-[#ffd400] decoration-2 underline-offset-4">
                        Create one
                    </Link>
                </p>
            </div>
        </main>
    );
}