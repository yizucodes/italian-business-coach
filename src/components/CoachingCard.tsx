import React from "react";
import type { CoachingEvent } from "@/types";

interface Props {
  event: CoachingEvent;
}

/** Format elapsed seconds as "M:SS" */
const formatCallTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

/** Convert snake_case / camelCase to Title Case */
const formatIssueType = (issueType: string): string =>
  issueType
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export const CoachingCard: React.FC<Props> = ({ event }) => {
  return (
    <div className="relative flex gap-3 rounded-lg border border-white/10 bg-black/40 p-3 backdrop-blur-sm overflow-hidden animate-fade-in">
      {/* Italian tricolore left stripe */}
      <div className="absolute left-0 inset-y-0 w-1 flex flex-col">
        <div className="flex-1 bg-[#008C45]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#CD212A]" />
      </div>

      <div className="ml-3 flex-1 min-w-0">
        {/* Issue type + timestamp row */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#008C45] uppercase tracking-wide truncate">
            🇮🇹 {formatIssueType(event.issueType)}
          </span>
          <span className="shrink-0 text-[10px] text-white/40">
            {formatCallTime(event.timestamp)} in
          </span>
        </div>

        {/* Explanation */}
        <p className="text-xs text-white/75 leading-relaxed">{event.explanation}</p>
      </div>
    </div>
  );
};
