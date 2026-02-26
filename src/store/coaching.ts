import { atom } from "jotai";
import type { CoachingEvent } from "../types";

export const coachingEventsAtom = atom<CoachingEvent[]>([]);
