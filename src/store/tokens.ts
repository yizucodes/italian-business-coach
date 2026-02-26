import { atom } from "jotai";

const getInitialToken = (): string | null => {
  const savedToken = localStorage.getItem("tavus-token");
  if (savedToken) return savedToken;
  return import.meta.env.VITE_TAVUS_API_KEY ?? null;
};

/** The user's Tavus API key; persisted to localStorage. */
export const apiTokenAtom = atom<string | null>(getInitialToken());

/** True while the token is being validated against the Tavus API. */
export const isValidatingTokenAtom = atom(false);

/** Derived selector: true when an API token is present. */
export const hasTokenAtom = atom((get) => get(apiTokenAtom) !== null);

/** Write-only atom that persists a new token to localStorage and the atom. */
export const setApiTokenAtom = atom(null, (_, set, token: string) => {
  localStorage.setItem("tavus-token", token);
  set(apiTokenAtom, token);
});

/** Write-only atom that clears the token from localStorage and the atom. */
export const clearApiTokenAtom = atom(null, (_, set) => {
  localStorage.removeItem("tavus-token");
  set(apiTokenAtom, null);
});
