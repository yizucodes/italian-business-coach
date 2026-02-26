import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { createConversation } from "@/api";
import { screenAtom } from "@/store/screens";
import { conversationAtom } from "@/store/conversation";
import { apiTokenAtom } from "@/store/tokens";

export interface UseCreateConversationReturn {
  isLoading: boolean;
  error: string | null;
  createConversationRequest: () => Promise<void>;
}

export function useCreateConversation(): UseCreateConversationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setScreenState] = useAtom(screenAtom);
  const [, setConversation] = useAtom(conversationAtom);
  const token = useAtomValue(apiTokenAtom);

  const createConversationRequest = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!token) throw new Error("API token is required");
      const conversation = await createConversation(token);
      setConversation(conversation);
      setScreenState({ currentScreen: "conversation" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create conversation",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, createConversationRequest };
}
