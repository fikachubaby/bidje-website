interface SummaryInput {
    stageName: string;
    propertyTitle?: string;
    daysBlocked: number;
    blockedReason?: string | null;
    notes?: string | null;
}

export async function generateLegalCaseSummary(input: SummaryInput): Promise<string> {
    const prompt = `You are helping a small property agency understand why a legal conveyancing case is stuck.

Property: ${input.propertyTitle ?? "Unknown"}
Stage: ${input.stageName}
Days stuck: ${input.daysBlocked}
Blocked reason (raw staff note): ${input.blockedReason ?? "Not specified"}
Additional notes: ${input.notes ?? "None"}

Write ONE short sentence (max 25 words) in plain English explaining the blocker and, if possible, a likely next action. Do not repeat the property name or stage name verbatim — just the explanation.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.ANTHROPIC_API_KEY!,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 100,
            messages: [{ role: "user", content: prompt }],
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Claude API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const textBlock = data.content?.find((c: { type: string }) => c.type === "text");
    return textBlock?.text?.trim() ?? "Unable to generate summary.";
}
