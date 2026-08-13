"use client";

import React, { useState } from "react";
import { ChevronDown, FileSearch } from "lucide-react";
import { PILLARS_DATA } from "@/constants/pillars";
import { ScoreBreakdown } from "@/types/score";

interface PillarsAccordionProps {
    breakdown: ScoreBreakdown;
}

export function PillarsAccordion({ breakdown }: PillarsAccordionProps) {
    const [expandedPillars, setExpandedPillars] = useState<Record<string, boolean>>({
        "pillar-bmv": true,
    });

    const togglePillar = (id: string) => {
        setExpandedPillars((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="space-y-4">
            {PILLARS_DATA.map((pillar) => {
                const isExpanded = !!expandedPillars[pillar.id];
                const pillarScore = breakdown[pillar.key];

                return (
                    <div
                        key={pillar.id}
                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${isExpanded ? pillar.color : "bg-slate-800/50 border-slate-800 hover:border-slate-700"
                            }`}
                    >
                        <button
                            onClick={() => togglePillar(pillar.id)}
                            className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                                    {pillar.icon}
                                </div>
                                <div>
                                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                                        {pillar.title}
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-0.5">{pillar.summary}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-900 border border-amber-400/30 text-[#ffd400]">
                                    {pillarScore} / {pillar.maxPoints} pts
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-white" : ""
                                        }`}
                                />
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-5 pb-6 pt-2 border-t border-slate-800/60 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                    {pillar.metrics.map((metric, idx) => (
                                        <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5">
                                            <span className="text-xs font-semibold text-[#ffd400] block mb-1">
                                                {metric.label}
                                            </span>
                                            <p className="text-xs text-slate-300 leading-relaxed">{metric.detail}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex items-start gap-3">
                                    <FileSearch className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                                    <div className="text-xs">
                                        <span className="font-semibold text-slate-200 block mb-0.5">
                                            Algorithmic Scoring Logic:
                                        </span>
                                        <p className="text-slate-400 leading-relaxed">{pillar.scoringLogic}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}