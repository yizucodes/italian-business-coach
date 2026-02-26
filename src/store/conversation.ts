import { atom } from "jotai";
import { IConversation } from "../types";

/** Active Tavus conversation object; null when no session is in progress. */
export const conversationAtom = atom<IConversation | null>(null);
