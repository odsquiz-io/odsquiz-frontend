"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, subscribeToAuthToken } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  lat: number;
  lon: number;
  points: number;
  created_at: string;
};

type SessionState = {
  status: "loading" | "authenticated" | "unauthenticated";
  user: SessionUser | null;
};

type Session = SessionState & {
  signOut: () => void;
  updateUser: (user: SessionUser) => void;
};

const SIGNED_OUT: SessionState = { status: "unauthenticated", user: null };

const SessionContext = createContext<Session>({
  status: "loading",
  user: null,
  signOut: () => {},
  updateUser: () => {},
});

async function fetchSession(signal: AbortSignal): Promise<SessionState> {
  const token = getAuthToken();

  if (!token) {
    return SIGNED_OUT;
  }

  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
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
    const unsubscribe = subscribeToAuthToken(sync);

    return () => {
      controller.abort();
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signOut: clearAuthToken,
      // Ignores a reply for an account that is no longer the one signed in.
      updateUser: (user: SessionUser) =>
        setState((current) =>
          current.user?.id === user.id ? { status: "authenticated", user } : current,
        ),
    }),
    [state],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
