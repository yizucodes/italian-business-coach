import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { screenAtom } from "@/store/screens";
import { coachingEventsAtom } from "@/store/coaching";
import { summaryScoresAtom } from "@/store/summary";
import { AnimatedWrapper } from "@/components/DialogWrapper";
import { ScoreCard } from "@/components/ScoreCard";
import { runDebriefJudge } from "@/api/debriefJudge";
import type { CoachingEvent, JudgeResult, ScoreCategory, ScoreResult } from "@/types";

// ── Category definitions ─────────────────────────────────────────────────────

const CATEGORIES: ScoreCategory[] = [
  {
    key: "rapport",
    label: "Rapport Building",
    icon: "🤝",
    color: "#008C45",
    keywords: [
      "rapport",
      "greeting",
      "formal",
      "relation",
      "personal",
      "trust",
      "social",
      "address",
      "title",
      "introduc",
      "handshak",
      "small talk",
    ],
  },
  {
    key: "energy",
    label: "Energy & Tone",
    icon: "⚡",
    color: "#E8A427",
    keywords: [
      "energy",
      "enthusiasm",
      "passion",
      "engag",
      "warm",
      "excit",
      "dynamic",
      "lively",
      "boring",
      "flat",
      "monoton",
      "expressi",
    ],
  },
  {
    key: "negotiation",
    label: "Negotiation Pace",
    icon: "📊",
    color: "#CD212A",
    keywords: [
      "negoti",
      "direct",
      "assertiv",
      "proposal",
      "price",
      "deal",
      "offer",
      "bargain",
      "pressure",
      "pushy",
      "demand",
      "concession",
      "rush",
      "urgent",
    ],
  },
];

// ── Score computation ────────────────────────────────────────────────────────

function matchesCategory(
  event: CoachingEvent,
  category: ScoreCategory,
): boolean {
  const haystack = `${event.issueType} ${event.explanation}`.toLowerCase();
  return category.keywords.some((kw) => haystack.includes(kw));
}

function computeScores(events: CoachingEvent[]): ScoreResult[] {
  return CATEGORIES.map((category) => {
    const matching = events.filter((e) => matchesCategory(e, category));

    // Heuristic: start at 10, subtract 1 per matching event, clamp 0–10.
    const score = Math.max(0, Math.min(10, 10 - matching.length));
    const latestMatch = matching[matching.length - 1];
    const evidence = latestMatch
      ? latestMatch.explanation
      : "No issues detected — great job!";

    return { category, score, evidence };
  });
}

// ── Summary screen ───────────────────────────────────────────────────────────

export const Summary: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [events, setEvents] = useAtom(coachingEventsAtom);
  const [, setScores] = useAtom(summaryScoresAtom);

  // Initialise with keyword scores so the UI is never empty
  const [results, setResults] = useState<ScoreResult[]>(() =>
    computeScores(events),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [judgeError, setJudgeError] = useState<string | null>(null);
  // Tracks whether the displayed results came from the LLM judge
  const [aiGenerated, setAiGenerated] = useState(false);

  // ── AI judge — runs once on mount ────────────────────────────────────────
  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!apiKey) {
      setJudgeError(
        "Summary based on coaching events. For AI-powered feedback, set VITE_OPENAI_API_KEY.",
      );
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    // Enforce a minimum 500 ms loading window so it never flashes
    const minDelay = new Promise<void>((r) => setTimeout(r, 500));

    Promise.all([runDebriefJudge(events), minDelay])
      .then(([judgeResult]) => {
        if (cancelled) return;
        const aiResults: ScoreResult[] = CATEGORIES.map((cat) => ({
          category: cat,
          score: judgeResult.scores[cat.key as keyof JudgeResult["scores"]],
          evidence:
            judgeResult.feedback[cat.key as keyof JudgeResult["feedback"]],
        }));
        setResults(aiResults);
        setAiGenerated(true);
        setIsLoading(false);
      })
      .catch(async (err: unknown) => {
        if (cancelled) return;
        if (import.meta.env.DEV) {
          console.error("[DebriefJudge]", err);
        }
        // Wait out any remaining minimum delay before swapping in fallback scores
        await minDelay;
        if (cancelled) return;
        setResults(computeScores(events));
        setAiGenerated(false);
        setJudgeError("AI scoring failed — showing keyword-based scores.");
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync scores to atom once loading is complete ─────────────────────────
  useEffect(() => {
    if (isLoading) return;
    setScores(
      results.map((r) => ({
        category: r.category.label,
        score: r.score,
        evidence: r.evidence,
        aiGenerated,
      })),
    );
  }, [results, isLoading, aiGenerated, setScores]);

  const overallScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / results.length,
  );

  const handlePracticeAgain = () => {
    setEvents([]);
    setScores([]);
    setScreenState({ currentScreen: "intro" });
  };

  return (
    <AnimatedWrapper>
      <div className="relative flex size-full flex-col items-center justify-center px-5 py-6 sm:p-8 overflow-y-auto">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-1 mb-6 shrink-0"
        >
          {/* Tricolore bar */}
          <div className="flex h-1 w-24 rounded-full overflow-hidden mb-2">
            <div className="flex-1 bg-[#008C45]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#CD212A]" />
          </div>

          <span className="text-3xl" role="img" aria-label="Italian flag">
            🇮🇹
          </span>
          <h1 className="text-xl font-bold text-white text-center font-mono">
            Coaching Debrief
          </h1>
          <p className="text-xs text-white/45 text-center max-w-xs">
            {events.length === 0
              ? "Excellent session — no cultural missteps detected."
              : `${events.length} coaching note${events.length === 1 ? "" : "s"} from this session.`}
          </p>

          {/* Overall score pill */}
          <div className="mt-2 flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-1.5">
            <span className="text-xs text-white/50 uppercase tracking-widest">
              Overall
            </span>
            <span className="text-base font-bold text-white">
              {isLoading ? "…" : `${overallScore}/10`}
            </span>
          </div>
        </motion.div>

        {/* ── Score cards / loading skeleton ── */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          {isLoading
            ? CATEGORIES.map((cat) => (
                <div
                  key={cat.key}
                  className="animate-pulse rounded-2xl border border-white/10 bg-white/5 h-24"
                  aria-label={`Loading ${cat.label} score`}
                />
              ))
            : results.map((result, i) => (
                <ScoreCard key={result.category.key} result={result} index={i} />
              ))}
        </div>

        {/* ── Fallback / error banner ── */}
        {!isLoading && judgeError && (
          <p className="mt-4 text-xs text-white/40 text-center max-w-xs">
            {judgeError}
          </p>
        )}

        {/* ── Practice Again CTA ── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          onClick={handlePracticeAgain}
          aria-label="Practice again"
          className="mt-6 shrink-0 flex items-center gap-2 rounded-xl border border-[#008C45]/70 bg-[#008C45]/20 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#008C45]/35 hover:border-[#008C45] hover:shadow-[0_0_20px_rgba(0,140,69,0.4)]"
        >
          Practice Again →
        </motion.button>
      </div>
    </AnimatedWrapper>
  );
};
