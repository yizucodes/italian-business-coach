import { atom } from "jotai";
import type { SummaryScore } from "../types";

/** Computed per-category scores written by the Summary screen after a session ends. */
export const summaryScoresAtom = atom<SummaryScore[]>([]);
