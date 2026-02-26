import React from "react";

interface Props {
  score: number;
  color: string;
}

export const ScoreRing: React.FC<Props> = ({ score, color }) => {
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
        className="[transition:stroke-dasharray_1.2s_ease]"
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
};
