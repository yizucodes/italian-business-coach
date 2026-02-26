import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";
import { PERSONA_GREETING } from "@/config";

const FALLBACK_PERSONA_ID = import.meta.env.VITE_PERSONA_ID ?? "pd43ffef";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  const settings = getDefaultStore().get(settingsAtom);

  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";

  const payload = {
    persona_id: settings.persona || FALLBACK_PERSONA_ID,
    custom_greeting: settings.greeting || PERSONA_GREETING,
    conversational_context: contextString,
  };

  const response = await fetch("https://tavusapi.com/v2/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": token ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (!response?.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data;
};
