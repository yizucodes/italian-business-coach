import { atom } from "jotai";

export type Screen =
  | "introLoading"
  | "outage"
  | "outOfMinutes"
  | "intro"
  | "instructions"
  | "settings"
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
  currentScreen: "summary",
};

export const screenAtom = atom<ScreenState>(initialScreenState);
