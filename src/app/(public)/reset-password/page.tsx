import { Navbar } from "@/components/layout/Navbar";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
    return (
        <main className="min-h-screen bg-neutral-50 text-black selection:bg-[#ffd400] selection:text-black flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col justify-center items-center px-5 py-8 sm:py-12">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-neutral-300 bg-white p-6 sm:p-8 shadow-sm">
                        <div className="space-y-1">
                            <h1 className="text-2xl font-black tracking-tight text-neutral-900">Set New Password</h1>
                            <p className="text-sm font-medium text-neutral-500">
                                Enter your new password below.
                            </p>
                        </div>

                        <div className="mt-5">
                            <ResetPasswordForm />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}