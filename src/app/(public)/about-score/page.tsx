"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Layers, Zap } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ScoreSimulator } from "@/components/score/ScoreSimulator";
import { PillarsAccordion } from "@/components/score/PillarsAccordion";
import { ScoreBreakdown } from "@/types/score";

export default function AboutScorePage() {
    const [breakdown, setBreakdown] = useState<ScoreBreakdown>({
        bmvScore: 28,
        yieldScore: 21,
        legalScore: 20,
        demandScore: 10,
    });

    return (
        <main className="min-h-screen bg-neutral-50 text-black selection:bg-[#ffd400] selection:text-black flex flex-col">
            <Navbar />
            <div className="min-h-screen bg-slate-900 text-slate-100">
                {/* 1. HERO SECTION */}
                <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
                    <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-slate-800 border border-amber-400/30 text-amber-400 text-xs font-semibold px-4 py-1.5 rounded-full">
                            <ShieldCheck className="w-4 h-4 text-[#ffd400]" />
                            <span>PROPTECH DEAL INTELLIGENCE ENGINE</span>
                        </div>

                        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                            Know the <span className="text-[#ffd400]">True Value</span> of Every Property Deal
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                            The <strong className="text-white">Bidje Score (0–100)</strong> is Malaysia’s first algorithmic deal rating for off-market, auction, and distressed properties.
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 pt-4">
                            <Link
                                href="/properties"
                                className="px-6 py-3.5 rounded-xl bg-[#ffd400] text-slate-950 font-bold hover:bg-yellow-400 transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10"
                            >
                                Browse Scored Deals <ArrowRight className="w-4 h-4" />
                            </Link>
                            <a href="#simulator" className="px-6 py-3.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-semibold hover:bg-slate-700 transition-all">
                                Try Score Simulator
                            </a>
                        </div>
                    </div>
                </section>

                {/* 2. ISOLATED SCORE SIMULATOR COMPONENT */}
                <ScoreSimulator onBreakdownChange={setBreakdown} />

                {/* 3. CORE METHODOLOGY / ACCORDION COMPONENT */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    <div className="text-center mb-10 space-y-2">
                        <div className="inline-flex items-center gap-2 text-[#ffd400] text-xs font-bold tracking-widest uppercase">
                            <Layers className="w-4 h-4" />
                            Core Methodology
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">The 4 Valuation Pillars Breakdown</h2>
                        <p className="text-slate-400 text-sm max-w-xl mx-auto">
                            Click each pillar below to see how current simulation parameters contribute to each sub-score in real-time.
                        </p>
                    </div>

                    <PillarsAccordion breakdown={breakdown} />
                </section>

                {/* 4. COMPARISON TABLE */}
                <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white mb-8">Why Bidje Score Changes the Game</h2>
                    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-800/40">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-800 text-slate-300 border-b border-slate-700">
                                <tr>
                                    <th className="p-4">Feature</th>
                                    <th className="p-4 text-slate-400">Traditional Classifieds</th>
                                    <th className="p-4 text-[#ffd400] font-bold">Bidje.com</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 text-slate-300">
                                <tr>
                                    <td className="p-4 font-semibold text-white">Focus Assets</td>
                                    <td className="p-4 text-slate-400">Retail agent listings</td>
                                    <td className="p-4 text-emerald-400 font-medium">Off-Market, Auction & Distressed Deals</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-white">Price Evaluation</td>
                                    <td className="p-4 text-slate-400">Asking price only (no verification)</td>
                                    <td className="p-4 text-emerald-400 font-medium">BMV % indexed against real JPPH transactions</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-white">Legal & Risk Insights</td>
                                    <td className="p-4 text-slate-400">None provided</td>
                                    <td className="p-4 text-emerald-400 font-medium">Caveat, title status & encumbrance flags</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-semibold text-white">Deal Decisioning</td>
                                    <td className="p-4 text-slate-400">Manual research across 4+ tools</td>
                                    <td className="p-4 text-[#ffd400] font-bold">Instant 0–100 Unified Deal Score</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 5. CTA SECTION */}
                <section className="py-16 px-4 text-center border-t border-slate-800">
                    <div className="max-w-3xl mx-auto space-y-4">
                        <h2 className="text-3xl font-black text-white">Ready to find off-market steals?</h2>
                        <p className="text-slate-400">
                            Access direct owner listings and scored property deals for just <strong className="text-[#ffd400]">RM 2/month</strong>.
                        </p>
                        <Link href="/properties" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ffd400] text-slate-950 font-black text-lg hover:bg-yellow-400 transition-all shadow-xl shadow-amber-500/10">
                            Start Browsing Properties <Zap className="w-5 h-5 fill-current" />
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}