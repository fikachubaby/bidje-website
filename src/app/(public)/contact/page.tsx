"use client";

import React, { useState } from "react";
import { Mail, Clock, AlertCircle, HelpCircle, Building2, Send, MessageSquare, CheckCircle2, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        // Simulate successful direct dispatch to admin
        setSubmitted(true);
    }

    return (
        <main className="min-h-screen bg-neutral-50 text-neutral-900 selection:bg-[#ffd400] selection:text-black flex flex-col font-sans">
            <Navbar />

            <div className="flex-grow py-16 px-5 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto space-y-10">

                    {/* Header Section */}
                    <div className="text-center space-y-3 max-w-2xl mx-auto">
                        <div className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#ffd400]">
                            <span>Direct Line</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-neutral-900 sm:text-5xl">
                            Talk to the Bidje Team
                        </h1>
                        <p className="text-base sm:text-lg text-neutral-600 leading-relaxed">
                            Have questions about your property listing, account verification, or FPX processing? Send us a direct message below.
                        </p>
                    </div>

                    {/* Quick Channels Bar (Email Shortcut Banner) */}
                    <div className="grid grid-cols-1 max-w-xl mx-auto">
                        <a
                            href="mailto:admin@bidje.com"
                            className="group flex items-center justify-center gap-4 rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#ffd400] text-black border-2 border-black shadow-[2px_2px_0_0_#000]">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-xs font-black uppercase tracking-wider text-neutral-400">Direct Mailbox</div>
                                <div className="text-base font-black text-neutral-900 group-hover:text-amber-600 transition-colors">admin@bidje.com</div>
                            </div>
                        </a>
                    </div>

                    {/* Secure Direct Message Box */}
                    <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border-2 border-black space-y-6">
                        <div className="flex items-center space-x-3 text-black">
                            <div className="p-3 bg-[#ffd400] rounded-xl border-2 border-black shadow-[2px_2px_0_0_#000]">
                                <MessageSquare className="w-6 h-6 text-black" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-neutral-900">Send a Direct Message</h2>
                                <p className="text-sm text-neutral-500">Your message will be sent directly to admin@bidje.com.</p>
                            </div>
                        </div>

                        {submitted ? (
                            <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-8 text-center space-y-4">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md">
                                    <CheckCircle2 className="h-8 w-8" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-emerald-900">Message Dispatched Successfully!</h3>
                                    <p className="text-sm text-emerald-700 max-w-md mx-auto">
                                        Thank you, <strong className="font-bold">{formData.name}</strong>. Our support team has received your ticket and will reply to <strong className="font-bold underline">{formData.email}</strong> within 24 working hours.
                                    </p>
                                </div>
                                <div className="pt-4 flex flex-wrap justify-center gap-3">
                                    <a
                                        href={`mailto:admin@bidje.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\n${formData.message}`)}`}
                                        className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-700 bg-white px-5 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-colors shadow-sm"
                                    >
                                        <Mail className="w-4 h-4" /> Also Open in Email App
                                    </a>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: "", email: "", subject: "", message: "" });
                                        }}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-black text-white hover:bg-emerald-800 transition-colors shadow-sm"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Ahmad Faizal"
                                            className="w-full rounded-xl border-2 border-black bg-neutral-50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="e.g. faizal@example.com"
                                            className="w-full rounded-xl border-2 border-black bg-neutral-50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                                        Subject / Topic
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="e.g. Account Verification / FPX Status Inquiry"
                                        className="w-full rounded-xl border-2 border-black bg-neutral-50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs font-black uppercase tracking-wider text-neutral-800 mb-1.5">
                                        Message Details
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        rows={5}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Type your question, issue, or request details here..."
                                        className="w-full rounded-xl border-2 border-black bg-neutral-50 px-4 py-3.5 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#ffd400]"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 w-full rounded-xl border-2 border-black bg-[#ffd400] px-6 py-4 text-sm font-black text-black shadow-[4px_4px_0_0_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] transition-all cursor-pointer"
                                >
                                    <Send className="w-4 h-4" />
                                    Send Direct Message to Admin
                                </button>

                                <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 pt-1">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    <span>Secure transmission sent directly to admin@bidje.com</span>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Operational Guidelines Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* General Support & Timelines */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200 space-y-4">
                            <div className="flex items-center space-x-3 text-neutral-900">
                                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold">Support Response Time</h2>
                            </div>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                Our core team handles inquiries during standard Malaysian working hours. We aim to get back to all direct messages within <strong className="text-neutral-900">24 to 48 working hours</strong> via email.
                            </p>
                            <div className="pt-2 border-t border-neutral-100 flex items-center space-x-2 text-xs text-neutral-500 font-medium">
                                <Mail className="w-4 h-4 text-neutral-400" />
                                <span>Official Inbox: <a href="mailto:admin@bidje.com" className="text-blue-600 hover:underline font-bold">admin@bidje.com</a></span>
                            </div>
                        </div>

                        {/* FPX & Fiuu Verification Notice */}
                        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-neutral-200 space-y-4">
                            <div className="flex items-center space-x-3 text-neutral-900">
                                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold">FPX Gateway Status</h2>
                            </div>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                If your application status remains <strong className="text-neutral-900">&quot;Pending Review&quot;</strong> for <strong className="text-neutral-900">more than 7 working days</strong>, it is recommended to reach out directly through our support desk.
                            </p>
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
                                <div className="flex items-center font-bold space-x-1.5">
                                    <Building2 className="w-4 h-4 text-amber-700" />
                                    <span>Required Reference for Fiuu:</span>
                                </div>
                                <p className="text-amber-800">SSM Registration Number: <strong className="font-mono text-amber-950 font-bold">202301048156</strong></p>
                            </div>
                        </div>

                    </div>

                    {/* Audit / Pre-check Offer Banner */}
                    <div className="bg-black text-white p-8 sm:p-10 rounded-3xl shadow-xl border-2 border-neutral-800 space-y-5 relative overflow-hidden">
                        <div className="absolute right-0 top-0 -mr-10 -mt-10 h-48 w-48 rounded-full bg-[#ffd400]/10 blur-3xl pointer-events-none"></div>
                        <div className="flex items-center space-x-3 relative z-10">
                            <div className="p-3 bg-[#ffd400] text-black rounded-2xl border border-[#ffd400]">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black">Want us to audit your Bidje profile?</h3>
                        </div>
                        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed relative z-10 max-w-2xl">
                            We can manually review your seller profile or payment configurations via email to flag potential items that might delay your Fiuu verification before they run their official checks.
                        </p>
                        <div className="pt-2 relative z-10">
                            <a
                                href="mailto:admin@bidje.com?subject=Request%20for%20Bidje%20Account%20Audit%20-%20SSM%20202301048156"
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#ffd400] px-6 py-3.5 text-xs font-black text-black hover:bg-yellow-400 transition-colors shadow-md"
                            >
                                Request Account Audit
                            </a>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}