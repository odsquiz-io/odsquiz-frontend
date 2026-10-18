import { useSyncExternalStore } from "react";

const TOKEN_STORAGE_KEY = "odsquiz-auth-token";

// The native "storage" event only reaches other tabs, so writes broadcast this.
const AUTH_CHANGE_EVENT = "odsquiz-auth-change";

export function getAuthToken() {
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function subscribeToAuthToken(onChange: () => void) {
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

// Undefined until hydration, so pages can tell "unknown" apart from "signed out".
export function useAuthToken() {
  return useSyncExternalStore(subscribeToAuthToken, getAuthToken, () => undefined);
}
