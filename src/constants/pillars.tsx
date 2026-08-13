import React from "react";
import { TrendingUp, DollarSign, ShieldCheck, BarChart3 } from "lucide-react";
import { PillarDetail } from "@/types/score";

export const PILLARS_DATA: PillarDetail[] = [
    {
        id: "pillar-bmv",
        key: "bmvScore",
        maxPoints: 35,
        title: "Pillar 1: Below Market Value (BMV) & Capital Upside",
        weight: "35% Weightage",
        icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
        color: "border-emerald-500/30 bg-emerald-500/5",
        summary: "Evaluates current asking/reserve price against actual historical transaction records from JPPH.",
        metrics: [
            { label: "JPPH Indexing", detail: "Compares against real sold data within 1.5km in the last 12 months." },
            { label: "Discount Threshold", detail: "0 points for market value; maximum points for ≥30% BMV." },
            { label: "Forced Equity", detail: "Quantifies immediate equity captured at point of purchase." },
        ],
        scoringLogic: "BMV % = ((JPPH Value - Asking Price) / JPPH Value) * 100. Higher discounts increase score linearly up to 35 pts.",
    },
    {
        id: "pillar-yield",
        key: "yieldScore",
        maxPoints: 30,
        title: "Pillar 2: Rental Yield & Cash Flow Performance",
        weight: "30% Weightage",
        icon: <DollarSign className="w-5 h-5 text-amber-400" />,
        color: "border-amber-500/30 bg-amber-500/5",
        summary: "Calculates gross & net rental returns against prevailing neighborhood rental benchmarks.",
        metrics: [
            { label: "Gross Yield Benchmark", detail: ">6.5% gross yield earns full points; <3% yield penalizes total score." },
            { label: "Rental Stability Index", detail: "Factored using area occupancy rates and tenant demand stats." },
            { label: "Cash Flow Margin", detail: "Estimates net passive return after maintenance & quit rent fees." },
        ],
        scoringLogic: "Gross Yield % = ((Monthly Rent * 12) / Asking Price) * 100. Scaled up to a maximum of 30 points.",
    },
    {
        id: "pillar-legal",
        key: "legalScore",
        maxPoints: 20,
        title: "Pillar 3: Legal Cleanliness & Title Due Diligence",
        weight: "20% Weightage",
        icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
        color: "border-blue-500/30 bg-blue-500/5",
        summary: "Detects hidden encumbrances, private caveats, master title delays, or auction legal holds.",
        metrics: [
            { label: "Caveat Check", detail: "Private caveats result in immediate 15–20 point deduction." },
            { label: "Title Type", detail: "Individual/Strata Title scores higher than unassigned Master Title." },
            { label: "Auction Proclamation", detail: "Scans POS conditions for outstanding developer consent fees." },
        ],
        scoringLogic: "Starts at 20 points. Deductions applied for active caveats or consent delays.",
    },
    {
        id: "pillar-demand",
        key: "demandScore",
        maxPoints: 15,
        title: "Pillar 4: Liquidity & Micro-Market Demand",
        weight: "15% Weightage",
        icon: <BarChart3 className="w-5 h-5 text-purple-400" />,
        color: "border-purple-500/30 bg-purple-500/5",
        summary: "Measures average Days-on-Market (DOM) and buyer velocity in the specific township.",
        metrics: [
            { label: "Days on Market", detail: "High transaction velocity areas (>5 deals/mo) add liquidity points." },
            { label: "Infrastructure Growth", detail: "Proximity to MRT/LRT stations or major commercial hubs." },
            { label: "Distressed Supply Ratio", detail: "Lower localized auction supply indicates healthier resale demand." },
        ],
        scoringLogic: "Scores up to 15 points based on localized transaction velocity and transit connectivity.",
    },
];