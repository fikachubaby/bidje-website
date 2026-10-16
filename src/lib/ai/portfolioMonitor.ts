import { z } from "zod";
import { generateStructured } from "@/lib/ai";
import type { InvestorProperty } from "@/types/investor";

export const AiAnalysisSchema = z.object({
    health: z.enum(["on_track", "at_risk", "blocked"]),
    stuck_area: z.enum(["legal", "renovation", "sales", "none"]),
    blocker: z.string().describe("What is stopping progress right now, one or two sentences. Empty if on track."),
    waiting_on: z.enum(["bidje", "lawyer", "land_office", "court", "investor", "contractor", "buyer", "none"]),
    next_action: z.string().describe("The single most useful next step for Bidje staff."),
    investor_message: z
        .string()
        .describe("Plain, reassuring 1-2 sentence status for the investor. No internal notes, no blame."),
});

export type AiAnalysis = z.infer<typeof AiAnalysisSchema> & { days_stalled: number };

const SYSTEM = `You monitor Malaysian property investment projects for Bidje, a property agency.
Each project moves through legal (estate/SPA, court or authority orders, Land Office registration), then renovation, then sales.
Legal is where projects most often stall: missing documents, waiting on lawyers, court dates, Land Office backlogs.
Given a project's checklist, timeline and staff updates, decide whether it is on track, at risk or blocked, and identify the real blocker.
Rules of thumb: no checklist or update progress for 30+ days is at risk; 60+ days with no progress, or an update mentioning a hold-up, is blocked.
Base every claim on the data given; if the data is thin, say what information is missing as the next action.`;

/** Days since the most recent milestone tick or staff update (or since signing). */
export function daysStalled(p: InvestorProperty, now = Date.now()) {
    const dates = [
        ...p.milestones.map((m) => m.doneAt),
        ...p.updates.map((u) => u.createdAt),
        p.dateSigned,
        p.createdAt,
    ].filter((d): d is string => Boolean(d));
    const latest = Math.max(...dates.map((d) => new Date(d).getTime()));
    return Math.max(0, Math.floor((now - latest) / 86400000));
}

function describe(p: InvestorProperty, stalled: number) {
    const checklist = (["legal", "renovation", "sales"] as const)
        .map((cat) => {
            const items = p.milestones
                .filter((m) => m.category === cat)
                .map((m) => `  [${m.done ? "x" : " "}] ${m.label}${m.doneAt ? ` (done ${m.doneAt.slice(0, 10)})` : ""}`);
            return `${cat.toUpperCase()}:\n${items.join("\n")}`;
        })
        .join("\n");
    const updates = p.updates
        .slice(0, 15)
        .map((u) => `- ${u.createdAt.slice(0, 10)} [${u.category}] ${u.message}`)
        .join("\n");
    const reminders = p.reminders
        .filter((r) => r.status === "scheduled")
        .map((r) => `- ${r.title} due ${r.dueDate}`)
        .join("\n");

    return `Address: ${p.address}
Current stage (set by staff): ${p.stage}
Date signed: ${p.dateSigned ?? p.dateSignedNote ?? "unknown"}
Expected completion: ${p.expectedCompletion ?? "not set"}
Today: ${new Date().toISOString().slice(0, 10)}
Days since last recorded progress: ${stalled}

Checklist:
${checklist}

Staff updates (newest first):
${updates || "none"}

Open reminders:
${reminders || "none"}

Legal firm: ${p.legalFirm?.name ?? "not assigned"}
Financing consultant: ${p.financingConsultant?.name ?? "not assigned"}

Internal notes: ${p.notes || "none"}`;
}

export async function analyseInvestorProperty(p: InvestorProperty): Promise<AiAnalysis> {
    const stalled = daysStalled(p);
    const result = await generateStructured({
        system: SYSTEM,
        text: describe(p, stalled),
        schema: AiAnalysisSchema,
        effort: "low",
        maxTokens: 4000,
    });
    return { ...result, days_stalled: stalled };
}
