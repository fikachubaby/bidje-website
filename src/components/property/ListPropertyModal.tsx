"use client";

import { useState, useEffect } from "react";
import { X, User, MapPin, Tag, Phone, Home, CheckCircle2 } from "lucide-react";
import { useSession } from "@/lib/auth/useSession";

interface ListPropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ListPropertyModal({ isOpen, onClose }: ListPropertyModalProps) {
    const { user } = useSession();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        expectedPrice: "",
        phone: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Pre-fill profile details if logged in
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.user_metadata?.full_name || user.email?.split("@")[0] || "",
                phone: user.user_metadata?.phone || prev.phone,
            }));
        }
    }, [user]);

    if (!isOpen) return null;

    // Handles auto-formatting expected price with commas (e.g. 760000 -> 760,000)
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        if (!rawValue) {
            setFormData((prev) => ({ ...prev, expectedPrice: "" }));
            return;
        }
        const formatted = Number(rawValue).toLocaleString("en-US");
        setFormData((prev) => ({ ...prev, expectedPrice: formatted }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/properties/list-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setSubmitted(true);
            }
        } catch (err) {
            console.error("Submission error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSubmitted(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="relative flex w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 rounded-full bg-neutral-100 p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-black transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Left Panel: English Brand Marketing */}
                <div className="hidden w-5/12 bg-black p-8 text-white md:flex md:flex-col md:justify-between relative overflow-hidden">
                    <div className="space-y-4 relative z-10">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffd400] text-black font-bold">
                            <Home className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-black leading-tight tracking-tight text-[#ffd400]">
                            Sell Your Property Effortlessly
                        </h2>
                        <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                            Our licensed professional agents will connect you with qualified buyers in no time.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-2.5 border-t border-white/10 pt-4 text-xs font-semibold text-neutral-300">
                        <div className="flex items-center gap-2 text-white">
                            <CheckCircle2 className="h-4 w-4 text-[#ffd400]" />
                            <span>Free Market Valuation</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <CheckCircle2 className="h-4 w-4 text-[#ffd400]" />
                            <span>Extensive Buyer Network</span>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="w-full p-6 sm:p-8 md:w-7/12">
                    {!submitted ? (
                        <>
                            <div className="mb-5">
                                <h3 className="text-xl font-black text-neutral-900">List Your Property</h3>
                                <p className="text-xs text-neutral-500 font-medium">
                                    {user ? "Welcome back! Confirm your property details below." : "Fill in your details and our licensed agent will contact you."}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-3.5">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 mb-1">Name :</label>
                                    <div className="relative flex items-center">
                                        <User className="absolute left-3 h-4 w-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter your full name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                {/* Property Address */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 mb-1">Property Address :</label>
                                    <div className="relative flex items-center">
                                        <MapPin className="absolute left-3 h-4 w-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Enter full property address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                {/* Expected Price (With Numbering Format) */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 mb-1">Expected Price To Sell (RM) :</label>
                                    <div className="relative flex items-center">
                                        <Tag className="absolute left-3 h-4 w-4 text-neutral-400" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Example: 760,000"
                                            value={formData.expectedPrice}
                                            onChange={handlePriceChange}
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-xs font-bold text-neutral-800 mb-1">Phone Number :</label>
                                    <div className="relative flex items-center">
                                        <Phone className="absolute left-3 h-4 w-4 text-neutral-400" />
                                        <input
                                            type="tel"
                                            required
                                            placeholder="Enter your phone number"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-10 pr-4 text-xs font-medium text-neutral-900 focus:border-black focus:bg-white focus:outline-none focus:ring-1 focus:ring-black"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="rounded-xl px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="rounded-xl bg-[#ffd400] px-5 py-2.5 text-xs font-black text-black shadow-sm transition-transform hover:bg-[#e6bf00] active:scale-95 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Property →"}
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="py-12 text-center space-y-3">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ffd400]/20 text-black">
                                <CheckCircle2 className="h-8 w-8 text-[#ffd400]" />
                            </div>
                            <h3 className="text-lg font-black text-neutral-900">Request Received!</h3>
                            <p className="text-xs text-neutral-600 max-w-xs mx-auto">
                                Thank you! Our team has received your submission and will get back to you shortly.
                            </p>
                            <button
                                onClick={handleClose}
                                className="mt-2 rounded-xl bg-[#ffd400] px-6 py-2 text-xs font-bold text-black hover:bg-[#e6bf00]"
                            >
                                Done
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}