import React, { useMemo, useEffect } from "react";
import { useAtom } from "jotai";
import { motion } from "framer-motion";
import { screenAtom } from "@/store/screens";
import { coachingEventsAtom } from "@/store/coaching";
import { summaryScoresAtom } from "@/store/summary";
import { AnimatedWrapper } from "@/components/DialogWrapper";
import type { CoachingEvent } from "@/types";

// ── Category definitions ─────────────────────────────────────────────────────

interface Category {
  key: string;
  label: string;
  icon: string;
  color: string;
  keywords: string[];
}

const CATEGORIES: Category[] = [
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
    label: "Energy & Enthusiasm",
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
    label: "Negotiation Directness",
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

interface ScoreResult {
  category: Category;
  score: number;
  evidence: string;
}

function matchesCategory(event: CoachingEvent, category: Category): boolean {
  const haystack = `${event.issueType} ${event.explanation}`.toLowerCase();
  return category.keywords.some((kw) => haystack.includes(kw));
}

function computeScores(events: CoachingEvent[]): ScoreResult[] {
  return CATEGORIES.map((category) => {
    const matching = events.filter((e) => matchesCategory(e, category));

    // Heuristic: start at 8, subtract 1 per matching event, clamp 0–10.
    const score = Math.max(0, Math.min(10, 8 - matching.length));
    const latestMatch = matching[matching.length - 1];
    const evidence = latestMatch
      ? latestMatch.explanation
      : "No issues detected — great job!";

    return { category, score, evidence };
  });
}

// ── Animated score ring (SVG) ────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number; color: string }> = ({
  score,
  color,
}) => {
  const r = 28;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 10) * circumference;

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      className="rotate-[-90deg]"
      aria-hidden="true"
    >
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="5"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${filled} ${circumference}`}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 6px ${color}80)`,
          transition: "stroke-dasharray 1.2s ease",
        }}
      />
    </svg>
  );
};

// ── Score card ───────────────────────────────────────────────────────────────

const ScoreCard: React.FC<{ result: ScoreResult; index: number }> = ({
  result,
  index,
}) => {
  const { category, score, evidence } = result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.25 + index * 0.13,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 backdrop-blur-sm overflow-hidden"
    >
      {/* Italian tricolore left stripe */}
      <div className="absolute left-0 inset-y-0 w-1 flex flex-col">
        <div className="flex-1 bg-[#008C45]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#CD212A]" />
      </div>

      {/* Top row: ring + label */}
      <div className="ml-3 flex items-center gap-4">
        {/* Animated ring with score overlay */}
        <div className="relative shrink-0 flex items-center justify-center w-[72px] h-[72px]">
          <ScoreRing score={score} color={category.color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white leading-none">
              {score}
            </span>
            <span className="text-[9px] text-white/40 leading-none">/10</span>
          </div>
        </div>

        {/* Category label */}
        <div className="flex flex-col gap-0.5">
          <span className="text-xl">{category.icon}</span>
          <span
            className="text-sm font-semibold text-white leading-tight"
            style={{ fontFamily: "Source Code Pro, monospace" }}
          >
            {category.label}
          </span>
        </div>
      </div>

      {/* Evidence quote */}
      <p className="ml-3 text-xs text-white/55 leading-relaxed border-l-2 border-white/10 pl-3 italic">
        {evidence}
      </p>
    </motion.div>
  );
};

// ── Summary screen ───────────────────────────────────────────────────────────

export const Summary: React.FC = () => {
  const [, setScreenState] = useAtom(screenAtom);
  const [events, setEvents] = useAtom(coachingEventsAtom);
  const [, setScores] = useAtom(summaryScoresAtom);

  const results = useMemo(() => computeScores(events), [events]);

  /** Sync computed scores to summaryScoresAtom so it stays the source of truth */
  useEffect(() => {
    setScores(
      results.map((r) => ({
        category: r.category.label,
        score: r.score,
        evidence: r.evidence,
      })),
    );
  }, [results, setScores]);

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
          <h1
            className="text-xl font-bold text-white text-center"
            style={{ fontFamily: "Source Code Pro, monospace" }}
          >
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
              {overallScore}/10
            </span>
          </div>
        </motion.div>

        {/* ── Score cards ── */}
        <div className="flex flex-col gap-3 w-full max-w-md">
          {results.map((result, i) => (
            <ScoreCard key={result.category.key} result={result} index={i} />
          ))}
        </div>

        {/* ── Practice Again CTA ── */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          onClick={handlePracticeAgain}
          className="mt-6 shrink-0 flex items-center gap-2 rounded-xl border border-[#008C45]/70 bg-[#008C45]/20 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#008C45]/35 hover:border-[#008C45] hover:shadow-[0_0_20px_rgba(0,140,69,0.4)]"
        >
          Practice Again →
        </motion.button>
      </div>
    </AnimatedWrapper>
  );
};
