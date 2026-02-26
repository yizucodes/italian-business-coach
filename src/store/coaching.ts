import { atom } from "jotai";
import type { CoachingEvent } from "../types";

/** Ordered list of cultural-coaching events fired during the active conversation. */
export const coachingEventsAtom = atom<CoachingEvent[]>([]);
