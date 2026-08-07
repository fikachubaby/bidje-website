import { Navbar } from "@/components/layout/Navbar";

export default function CheckEmailPage() {
    return (
        <main className="min-h-screen bg-white text-black">
            <Navbar />
            <div className="mx-auto flex max-w-md flex-col items-center justify-center px-5 py-24 text-center sm:px-6">
                <h1 className="text-2xl font-black tracking-tight text-black">Check your email</h1>
                <p className="mt-3 text-sm font-medium text-black/60">
                    We&apos;ve sent a confirmation link to your email address. Click it to activate
                    your account, then sign in.
                </p>
            </div>
        </main>
    );
}