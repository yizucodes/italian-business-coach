import { atom } from "jotai";

/** Highest positive score point reached this session (0 – 0.75). */
export const niceScoreAtom = atom<number>(0);

/** Most-negative score point reached this session (-0.75 – 0). */
export const naughtyScoreAtom = atom<number>(0);
