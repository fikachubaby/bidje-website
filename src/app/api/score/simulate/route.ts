import { NextResponse } from "next/server";

export interface ScoreSimulationPayload {
    marketValue: number;
    askingPrice: number;
    monthlyRent: number;
    hasEncumbrance: boolean;
}

export async function POST(request: Request) {
    try {
        const body: ScoreSimulationPayload = await request.json();
        const { marketValue, askingPrice, monthlyRent, hasEncumbrance } = body;

        // Basic Input Validation
        if (
            typeof marketValue !== "number" ||
            typeof askingPrice !== "number" ||
            typeof monthlyRent !== "number" ||
            marketValue <= 0 ||
            askingPrice <= 0
        ) {
            return NextResponse.json(
                { error: "Invalid valuation parameters." },
                { status: 400 }
            );
        }

        // Pillar 1: BMV & Capital Upside (35% Max)
        const bmvPercent = Math.max(0, ((marketValue - askingPrice) / marketValue) * 100);
        const bmvScore = Math.min(35, (bmvPercent / 30) * 35);

        // Pillar 2: Rental Yield & Cash Flow (30% Max)
        const grossYield = askingPrice > 0 ? ((monthlyRent * 12) / askingPrice) * 100 : 0;
        const yieldScore = Math.min(30, (grossYield / 7) * 30);

        // Pillar 3: Legal Risk & Due Diligence (20% Max)
        const legalScore = hasEncumbrance ? 5 : 20;

        // Pillar 4: Liquidity & Demand (15% Max)
        const demandScore = 10;

        // Total Combined Score (15 to 99 range)
        const rawTotal = bmvScore + yieldScore + legalScore + demandScore;
        const finalScore = Math.min(Math.max(Math.round(rawTotal), 15), 99);

        return NextResponse.json({
            score: finalScore,
            metrics: {
                bmvPercent: Math.round(bmvPercent),
                grossYield: Number(grossYield.toFixed(1)),
            },
            breakdown: {
                bmvScore: Number(bmvScore.toFixed(1)),
                yieldScore: Number(yieldScore.toFixed(1)),
                legalScore,
                demandScore,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error running score simulation." },
            { status: 500 }
        );
    }
}