import { atom } from "jotai";

const getInitialToken = (): string | null => {
  // Prefer a user-entered token that was persisted in localStorage
  const savedToken = localStorage.getItem("tavus-token");
  if (savedToken) return savedToken;
  // Fall back to the env var so the field auto-fills when set in .env.local
  return import.meta.env.VITE_TAVUS_API_KEY ?? null;
};

export const apiTokenAtom = atom<string | null>(getInitialToken());

export const isValidatingTokenAtom = atom(false);

export const hasTokenAtom = atom((get) => get(apiTokenAtom) !== null);

export const setApiTokenAtom = atom(null, (_, set, token: string) => {
  localStorage.setItem("tavus-token", token);
  set(apiTokenAtom, token);
});

export const clearApiTokenAtom = atom(null, (_, set) => {
  localStorage.removeItem("tavus-token");
  set(apiTokenAtom, null);
});
