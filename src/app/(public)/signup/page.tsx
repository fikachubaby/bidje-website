import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="mx-auto flex max-w-md flex-col justify-center px-5 py-20 sm:px-6">
                <h1 className="text-3xl font-black tracking-tight text-black">Create your account</h1>
                <p className="mt-2 text-sm font-medium text-black/60">
                    Register to submit offers on properties you like.
                </p>
                <div className="mt-8">
                    <SignupForm />
                </div>
                <p className="mt-6 text-sm font-medium text-black/60">
                    Already have an account?{" "}
                    <Link href="/login" className="font-bold text-black underline decoration-[#ffd400] decoration-2 underline-offset-4">
                        Sign in
                    </Link>
                </p>
            </div>
        </main>
    );
}