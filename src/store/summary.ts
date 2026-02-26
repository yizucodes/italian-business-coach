import { atom } from "jotai";
import type { SummaryScore } from "../types";

export const summaryScoresAtom = atom<SummaryScore[]>([]);
