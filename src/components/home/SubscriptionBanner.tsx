"use client";

import React, { useState } from "react";

export default function SubscriptionBanner() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setStatusMessage(null);

        try {
            console.log("Subscribing email:", email);
            setStatusMessage("Redirecting to subscription...");
        } catch (err) {
            console.error(err);
            setStatusMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="w-full bg-black py-12 px-4 sm:px-6 lg:px-8 border-y border-neutral-800">
            <div
                style={{ backgroundColor: "rgba(255, 204, 0, 0.12)" }}
                className="max-w-7xl mx-auto rounded-2xl border border-[#ffcc00]/30 p-6 sm:p-8 lg:p-10 backdrop-blur-md shadow-2xl"
            >
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

                    {/* Content Side */}
                    <div className="space-y-3 text-center lg:text-left max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-[#ffcc00]/20 border border-[#ffcc00]/40 text-[#ffcc00] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            <span>🔥 Exclusive Property Alerts</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                            Never Miss a Below-Market Deal
                        </h2>
                        <p className="text-neutral-300 text-sm sm:text-base font-normal leading-relaxed">
                            Get instant updates on the latest property listings and market opportunities delivered to you for only <span className="font-extrabold text-[#ffcc00] bg-[#ffcc00]/10 px-2 py-0.5 rounded border border-[#ffcc00]/30">RM2 / month</span>.
                        </p>
                    </div>

                    {/* Input / Form Side */}
                    <div className="w-full lg:w-auto">
                        <form
                            onSubmit={handleSubscribe}
                            className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto lg:mx-0"
                        >
                            <input
                                type="email"
                                required
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="px-4 py-3 rounded-xl text-white bg-neutral-900 border border-neutral-700 focus:outline-none focus:border-[#ffcc00] w-full text-sm placeholder:text-neutral-500 shadow-sm transition-colors"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ backgroundColor: "#ffcc00" }}
                                className="px-6 py-3 text-black font-bold rounded-xl hover:brightness-110 transition-all duration-200 whitespace-nowrap text-sm disabled:opacity-50 cursor-pointer shadow-md"
                            >
                                {loading ? "Processing..." : "Subscribe — RM2/mo"}
                            </button>
                        </form>

                        {statusMessage && (
                            <p className="text-xs font-bold text-[#ffcc00] mt-2.5 text-center lg:text-left">
                                {statusMessage}
                            </p>
                        )}
                        <p className="text-xs text-neutral-400 font-medium mt-2.5 text-center lg:text-left">
                            Cancel anytime. No lock-in contract.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}