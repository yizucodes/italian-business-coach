import { atom } from "jotai";

interface Settings {
  name: string;
  greeting: string;
  context: string;
  persona: string;
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem("tavus-settings");
  if (savedSettings) {
    return JSON.parse(savedSettings) as Settings;
  }
  return {
    name: "",
    greeting: "",
    context: "",
    persona: "",
  };
};

/** Session settings consumed by createConversation (persona, greeting, context). */
export const settingsAtom = atom<Settings>(getInitialSettings());
