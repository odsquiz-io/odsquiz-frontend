"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, subscribeToAuthToken } from "@/lib/auth";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
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
  // Set when the session ended because the account was suspended, until the notice is dismissed.
  suspended: boolean;
  signOut: () => void;
  signOutSuspended: () => void;
  dismissSuspended: () => void;
  updateUser: (user: SessionUser) => void;
};

export class AccountSuspendedError extends Error {}

export function isAccountSuspended(payload: unknown) {
  return (payload as { code?: unknown } | null)?.code === "account_suspended";
}

const SIGNED_OUT: SessionState = { status: "unauthenticated", user: null };

const SessionContext = createContext<Session>({
  status: "loading",
  user: null,
  suspended: false,
  signOut: () => {},
  signOutSuspended: () => {},
  dismissSuspended: () => {},
  updateUser: () => {},
});

async function fetchSession(
  signal: AbortSignal,
): Promise<SessionState & { suspended?: boolean }> {
  const token = getAuthToken();

  if (!token) {
    return SIGNED_OUT;
  }

  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });

  if (!response.ok) {
    const suspended =
      response.status === 403 &&
      isAccountSuspended(await response.json().catch(() => undefined));

    if (response.status === 401 || suspended) {
      clearAuthToken();
    }

    return { ...SIGNED_OUT, suspended };
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
  const [suspended, setSuspended] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const sync = () =>
      fetchSession(controller.signal)
        .then(({ suspended: ended, ...nextState }) => {
          setState(nextState);

          if (ended) {
            setSuspended(true);
          }
        })
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
      suspended,
      signOut: clearAuthToken,
      signOutSuspended: () => {
        setSuspended(true);
        clearAuthToken();
      },
      dismissSuspended: () => setSuspended(false),
      // Ignores a reply for an account that is no longer the one signed in.
      updateUser: (user: SessionUser) =>
        setState((current) =>
          current.user?.id === user.id ? { status: "authenticated", user } : current,
        ),
    }),
    [state, suspended],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
