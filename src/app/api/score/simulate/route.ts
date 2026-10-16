import { NextResponse } from "next/server";
import { computeBidjeScore } from "@/lib/score/bidjeScore";

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

        const { score, breakdown } = computeBidjeScore({
            askingPrice,
            marketValue,
            monthlyRent,
            hasEncumbrance,
        });

        return NextResponse.json({
            score,
            metrics: {
                bmvPercent: breakdown.bmvPercent ?? 0,
                grossYield: breakdown.grossYield ?? 0,
            },
            breakdown: {
                bmvScore: breakdown.bmvScore,
                yieldScore: breakdown.yieldScore,
                legalScore: breakdown.legalScore,
                demandScore: breakdown.demandScore,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error running score simulation." },
            { status: 500 }
        );
    }
}