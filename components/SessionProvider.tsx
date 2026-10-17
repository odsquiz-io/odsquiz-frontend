"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const TOKEN_STORAGE_KEY = "odsquiz-auth-token";

// The native "storage" event only reaches other tabs, so writes broadcast this.
const AUTH_CHANGE_EVENT = "odsquiz-auth-change";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  address: string;
  cep: string;
  points: number;
};

type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
};

const SIGNED_OUT: SessionState = { status: "unauthenticated", user: null };

const SessionContext = createContext<SessionState & { signOut: () => void }>({
  status: "loading",
  user: null,
  signOut: () => {},
});

export function storeAuthToken(token: string) {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function clearAuthToken() {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

async function fetchSession(signal: AbortSignal): Promise<SessionState> {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);

  if (!token) {
    return SIGNED_OUT;
  }

  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }

    return SIGNED_OUT;
  }

  return {
    status: "authenticated",
    user: (await response.json()) as SessionUser,
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    status: "loading",
    user: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    const sync = () =>
      fetchSession(controller.signal)
        .then(setState)
        .catch(() => {
          if (!controller.signal.aborted) {
            setState(SIGNED_OUT);
          }
        });

    void sync();
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      controller.abort();
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const signOut = useCallback(() => clearAuthToken(), []);
  const value = useMemo(() => ({ ...state, signOut }), [state, signOut]);

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
