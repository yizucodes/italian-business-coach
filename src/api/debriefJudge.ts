import type { CoachingEvent, JudgeResult } from "@/types";

// Re-export so consumers can import both the function and type from one place.
export type { JudgeResult } from "@/types";

// ── Typed error ───────────────────────────────────────────────────────────────

export class DebriefJudgeError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "DebriefJudgeError";
  }
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert Italian business culture coach evaluating a sales training conversation.

Analyze the provided coaching events and score the trainee across three dimensions on a scale of 0–10 (10 = excellent, 0 = very poor). Deduct points for each recorded issue in that category.

Return a JSON object with exactly this shape — no extra keys:
{
  "scores": {
    "rapport": <integer 0–10>,
    "energy": <integer 0–10>,
    "negotiation": <integer 0–10>
  },
  "feedback": {
    "rapport": "<one concise sentence of qualitative feedback>",
    "energy": "<one concise sentence of qualitative feedback>",
    "negotiation": "<one concise sentence of qualitative feedback>"
  },
  "overall": "<one concise sentence summarising the session>"
}

Scoring dimensions:
- rapport  (Rapport Building)  — warmth, relationship-first approach, proper use of titles, small talk, personal connection.
- energy   (Energy & Tone)     — expressiveness, enthusiasm, vocal variety; deduct for flat or monotone delivery.
- negotiation (Negotiation Pace) — patience, avoiding rushed or high-pressure closings, leaving space for deliberation.

Rules:
- If a dimension had zero relevant events, set the score to 7 and note in the feedback that it was not tested (e.g. "Negotiation pace wasn't evaluated in this call.").
- If there are no coaching events at all, set all scores to 10 and give positive feedback.
- All score values must be integers.`;

// ── OpenAI response shape (minimal) ──────────────────────────────────────────

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function runDebriefJudge(
  events: CoachingEvent[],
): Promise<JudgeResult> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    throw new DebriefJudgeError("VITE_OPENAI_API_KEY is not configured.");
  }

  const eventsContext =
    events.length === 0
      ? "No coaching events were recorded during this call."
      : events
          .map((e, i) => `Event ${i + 1}: [${e.issueType}] ${e.explanation}`)
          .join("\n");

  const userMessage = `Coaching events from this training call:\n\n${eventsContext}\n\nPlease evaluate and return the JSON score object.`;

  let response: Response;
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });
  } catch (err) {
    throw new DebriefJudgeError("Network request to OpenAI failed.", err);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new DebriefJudgeError(
      `OpenAI API returned ${response.status}${body ? `: ${body}` : ""}`,
    );
  }

  let data: OpenAIResponse;
  try {
    data = (await response.json()) as OpenAIResponse;
  } catch (err) {
    throw new DebriefJudgeError("Failed to parse OpenAI HTTP response.", err);
  }

  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new DebriefJudgeError(
      "Unexpected OpenAI response shape — missing message content.",
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch (err) {
    throw new DebriefJudgeError(
      "Judge returned malformed JSON in message content.",
      err,
    );
  }

  return validateJudgeResult(parsed);
}

// ── Validation ────────────────────────────────────────────────────────────────

function validateJudgeResult(raw: unknown): JudgeResult {
  if (typeof raw !== "object" || raw === null) {
    throw new DebriefJudgeError("Judge result is not an object.");
  }

  const r = raw as Record<string, unknown>;

  const scores = r.scores as Record<string, unknown> | undefined;
  const feedback = r.feedback as Record<string, unknown> | undefined;

  if (typeof scores !== "object" || scores === null) {
    throw new DebriefJudgeError("Judge result is missing 'scores' object.");
  }
  if (typeof feedback !== "object" || feedback === null) {
    throw new DebriefJudgeError("Judge result is missing 'feedback' object.");
  }

  const requiredScoreKeys: Array<keyof JudgeResult["scores"]> = [
    "rapport",
    "energy",
    "negotiation",
  ];
  for (const key of requiredScoreKeys) {
    if (typeof scores[key] !== "number") {
      throw new DebriefJudgeError(
        `Judge result 'scores.${key}' is not a number (got ${typeof scores[key]}).`,
      );
    }
  }

  const requiredFeedbackKeys: Array<keyof JudgeResult["feedback"]> = [
    "rapport",
    "energy",
    "negotiation",
  ];
  for (const key of requiredFeedbackKeys) {
    if (typeof feedback[key] !== "string") {
      throw new DebriefJudgeError(
        `Judge result 'feedback.${key}' is not a string (got ${typeof feedback[key]}).`,
      );
    }
  }

  return {
    scores: {
      rapport: clampScore(scores.rapport as number),
      energy: clampScore(scores.energy as number),
      negotiation: clampScore(scores.negotiation as number),
    },
    feedback: {
      rapport: (feedback.rapport as string).trim(),
      energy: (feedback.energy as string).trim(),
      negotiation: (feedback.negotiation as string).trim(),
    },
    ...(typeof r.overall === "string" && r.overall.trim()
      ? { overall: r.overall.trim() }
      : {}),
  };
}

function clampScore(n: number): number {
  return Math.round(Math.max(0, Math.min(10, n)));
}
