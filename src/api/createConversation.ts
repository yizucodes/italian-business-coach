import { IConversation } from "@/types";
import { settingsAtom } from "@/store/settings";
import { getDefaultStore } from "jotai";

const FALLBACK_PERSONA_ID =
  import.meta.env.VITE_PERSONA_ID ?? "pd43ffef";

const MATTEO_GREETING =
  "Benvenuto. I'm Matteo Rossi. Please, take a seat — let's talk business.";

export const createConversation = async (
  token: string,
): Promise<IConversation> => {
  const settings = getDefaultStore().get(settingsAtom);

  if (import.meta.env.DEV) {
    console.log("[dev] createConversation settings:", settings);
  }

  let contextString = "";
  if (settings.name) {
    contextString = `You are talking with the user, ${settings.name}. Additional context: `;
  }
  contextString += settings.context || "";

  const payload = {
    persona_id: settings.persona || FALLBACK_PERSONA_ID,
    custom_greeting: settings.greeting || MATTEO_GREETING,
    conversational_context: contextString,
  };

  if (import.meta.env.DEV) {
    console.log("[dev] createConversation payload:", payload);
  }

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
