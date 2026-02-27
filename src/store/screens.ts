import { atom } from "jotai";

export type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "intro"
  | "instructions"
  | "conversation"
  | "conversationError"
  | "positiveFeedback"
  | "negativeFeedback"
  | "finalScreen"
  | "sessionEnded"
  | "summary";

interface ScreenState {
  currentScreen: Screen;
}

const initialScreenState: ScreenState = {
  currentScreen: "introLoading",
};

/** Tracks which screen is currently rendered by App.tsx. */
export const screenAtom = atom<ScreenState>(initialScreenState);
