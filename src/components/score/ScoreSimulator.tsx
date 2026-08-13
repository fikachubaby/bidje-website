"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, AlertTriangle, Loader2 } from "lucide-react";
import { ScoreBreakdown } from "@/types/score";
import { getScoreBadge, calculateLocalScoreFallback } from "@/lib/utils/score";

interface ScoreSimulatorProps {
    onBreakdownChange?: (breakdown: ScoreBreakdown) => void;
}

export function ScoreSimulator({ onBreakdownChange }: ScoreSimulatorProps) {
    const [marketValue, setMarketValue] = useState<number>(500000);
    const [askingPrice, setAskingPrice] = useState<number>(380000);
    const [monthlyRent, setMonthlyRent] = useState<number>(2200);
    const [hasEncumbrance, setHasEncumbrance] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [score, setScore] = useState<number>(75);

    const bmvPercent = Math.round(((marketValue - askingPrice) / marketValue) * 100);
    const grossYield = parseFloat(((monthlyRent * 12) / askingPrice * 100).toFixed(1));

    const calculateScore = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/score/simulate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    marketValue,
                    askingPrice,
                    monthlyRent,
                    hasEncumbrance,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setScore(data.score);
                if (data.breakdown && onBreakdownChange) {
                    onBreakdownChange(data.breakdown);
                }
            } else {
                throw new Error("API simulation endpoint error");
            }
        } catch {
            const fallback = calculateLocalScoreFallback(
                marketValue,
                askingPrice,
                monthlyRent,
                hasEncumbrance
            );
            setScore(fallback.score);
            if (onBreakdownChange) {
                onBreakdownChange(fallback.breakdown);
            }
        } finally {
            setIsLoading(false);
        }
    }, [marketValue, askingPrice, monthlyRent, hasEncumbrance, onBreakdownChange]);

    useEffect(() => {
        const timer = setTimeout(() => {
            calculateScore();
        }, 200);
        return () => clearTimeout(timer);
    }, [calculateScore]);

    const badge = getScoreBadge(score);

    return (
        <section id="simulator" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-10 space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#ffd400]" />
                    Test the Bidje Score Algorithm
                </h2>
                <p className="text-[#ffd400] text-sm">
                    Connected to live endpoint <code className="bg-slate-800 px-2 py-0.5 rounded text-xs">/api/score/simulate</code>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-2xl">
                {/* Sliders & Inputs Column */}
                <div className="lg:col-span-7 space-y-6">
                    <div>
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-slate-300">JPPH Estimated Market Value</span>
                            <span className="text-[#ffd400] font-bold">RM {marketValue.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="200000"
                            max="1500000"
                            step="25000"
                            value={marketValue}
                            onChange={(e) => setMarketValue(Number(e.target.value))}
                            className="w-full accent-[#ffd400] cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-slate-300">Asking / Auction Reserve Price</span>
                            <span className="text-[#ffd400] font-bold">RM {askingPrice.toLocaleString()}</span>
                        </div>
                        <input
                            type="range"
                            min="150000"
                            max={marketValue}
                            step="10000"
                            value={askingPrice}
                            onChange={(e) => setAskingPrice(Number(e.target.value))}
                            className="w-full accent-[#ffd400] cursor-pointer"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-slate-300">Estimated Monthly Rental</span>
                            <span className="text-[#ffd400] font-bold">RM {monthlyRent.toLocaleString()} / mo</span>
                        </div>
                        <input
                            type="range"
                            min="800"
                            max="8000"
                            step="100"
                            value={monthlyRent}
                            onChange={(e) => setMonthlyRent(Number(e.target.value))}
                            className="w-full accent-[#ffd400] cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-900/60 rounded-xl border border-slate-700">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            <div>
                                <div className="text-sm font-semibold text-slate-200">Legal Encumbrance / Caveat Risk</div>
                                <div className="text-xs text-slate-400">Master title delay, auction legal hold, or caveats</div>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={hasEncumbrance}
                            onChange={(e) => setHasEncumbrance(e.target.checked)}
                            className="w-5 h-5 accent-rose-500 rounded cursor-pointer"
                        />
                    </div>
                </div>

                {/* Dynamic Score Display Column */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-700 rounded-xl p-6 flex flex-col justify-between items-center text-center relative">
                    {isLoading && (
                        <div className="absolute top-3 right-3 text-[#ffd400] flex items-center gap-1 text-xs">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Syncing API...</span>
                        </div>
                    )}

                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Live Simulated Rating
                    </span>

                    <div className="relative my-4 flex items-center justify-center">
                        <div className="w-36 h-36 rounded-full border-8 border-slate-800 flex items-center justify-center relative">
                            <span className="text-5xl font-black text-white">{score}</span>
                            <span className="text-xs text-slate-400 absolute bottom-4">/ 100</span>
                        </div>
                    </div>

                    <div className={`px-4 py-1.5 rounded-full border text-xs font-bold ${badge.color}`}>
                        {badge.label}
                    </div>

                    <p className="text-xs text-slate-400 mt-3 px-2 leading-relaxed">
                        {badge.desc}
                    </p>

                    <div className="w-full grid grid-cols-2 gap-2 mt-6 text-left text-xs bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                        <div>
                            <span className="text-slate-500 block">BMV Discount</span>
                            <span className="font-bold text-slate-200">{bmvPercent}% Below Value</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Gross Yield</span>
                            <span className="font-bold text-slate-200">{grossYield}% Annual</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}