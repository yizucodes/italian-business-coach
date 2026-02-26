import React, { useEffect, useRef } from "react";
import { useAtomValue } from "jotai";
import { coachingEventsAtom } from "@/store/coaching";
import { CoachingCard } from "./CoachingCard";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export const CoachingSidebar: React.FC<Props> = ({ className }) => {
  const events = useAtomValue(coachingEventsAtom);
  const bottomRef = useRef<HTMLDivElement>(null);

  /** Auto-scroll to newest card when a new event arrives */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events.length]);

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2.5xl border-2 border-primary bg-wrapper backdrop-blur-sm",
        className,
      )}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-white/10 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          🇮🇹 <span>Coaching Notes</span>
          {events.length > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#CD212A] px-1.5 text-[10px] font-bold text-white">
              {events.length}
            </span>
          )}
        </h2>
      </div>

      {/* Event list */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center">
            <span className="text-3xl opacity-30">📋</span>
            <p className="text-xs text-white/35 leading-relaxed">
              Coaching notes will appear here when Matteo detects a cultural
              misstep.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 p-3">
            {events.map((event) => (
              <CoachingCard key={event.id} event={event} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
