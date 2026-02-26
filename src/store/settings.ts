import { atom } from "jotai";

interface Settings {
  name: string;
  language: string;
  interruptSensitivity: string;
  greeting: string;
  context: string;
  persona: string;
  replica: string;
}

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem("tavus-settings");
  if (savedSettings) {
    return JSON.parse(savedSettings) as Settings;
  }
  return {
    name: "",
    language: "en",
    interruptSensitivity: "medium",
    greeting: "",
    context: "",
    persona: "",
    replica: "",
  };
};

/** User-configurable session settings (persona, language, context, etc.). */
export const settingsAtom = atom<Settings>(getInitialSettings());

/** True immediately after the user saves settings; used to show a confirmation badge in the header. */
export const settingsSavedAtom = atom<boolean>(false);
