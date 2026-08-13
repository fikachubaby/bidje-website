import { ReactNode } from "react";

export interface ScoreBreakdown {
    bmvScore: number;
    yieldScore: number;
    legalScore: number;
    demandScore: number;
}

export interface MetricDetail {
    label: string;
    detail: string;
}

export interface PillarDetail {
    id: string;
    key: keyof ScoreBreakdown;
    maxPoints: number;
    title: string;
    weight: string;
    icon: ReactNode;
    color: string;
    summary: string;
    metrics: MetricDetail[];
    scoringLogic: string;
}

export interface ScoreBadge {
    label: string;
    color: string;
    desc: string;
}

export interface ScoreSimulationPayload {
    marketValue: number;
    askingPrice: number;
    monthlyRent: number;
    hasEncumbrance: boolean;
}

export interface ScoreApiResponse {
    score: number;
    metrics: {
        bmvPercent: number;
        grossYield: number;
    };
    breakdown: ScoreBreakdown;
}