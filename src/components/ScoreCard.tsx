import React from "react";
import { motion } from "framer-motion";
import { ScoreRing } from "./ScoreRing";
import type { ScoreResult } from "@/types";

interface Props {
  result: ScoreResult;
  index: number;
}

export const ScoreCard: React.FC<Props> = ({ result, index }) => {
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
        <div className="relative shrink-0 flex items-center justify-center w-[72px] h-[72px]">
          <ScoreRing score={score} color={category.color} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-white leading-none">
              {score}
            </span>
            <span className="text-[9px] text-white/40 leading-none">/10</span>
          </div>
        </div>

        <div className="flex flex-col gap-0.5">
          <span className="text-xl">{category.icon}</span>
          <span className="text-sm font-semibold text-white leading-tight font-mono">
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
