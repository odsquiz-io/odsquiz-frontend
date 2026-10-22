import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { AccountSuspendedError, useSession } from "@/components/SessionProvider";
import { errorMessage } from "./api";

const MINUTE = 60_000;

function subscribeToMinutes(onChange: () => void) {
  const timer = window.setInterval(onChange, MINUTE);

  return () => window.clearInterval(timer);
}

function currentMinute() {
  return Math.floor(Date.now() / MINUTE) * MINUTE;
}

// Refreshes relative times once a minute.
export function useNow() {
  return useSyncExternalStore(subscribeToMinutes, currentMinute, currentMinute);
}

// Turns an error into page copy and ends the session when the account was suspended.
export function useFailure() {
  const { signOutSuspended } = useSession();

  return useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof AccountSuspendedError) {
        signOutSuspended();
      }

      return errorMessage(error, fallback);
    },
    [signOutSuspended],
  );
}

// Focuses an element by id after the next render, once it exists.
export function useFocusRequest() {
  const [request, setRequest] = useState<{ id: string; count: number }>();

  useEffect(() => {
    if (request) {
      document.getElementById(request.id)?.focus();
    }
  }, [request]);

  return useCallback(
    (id: string) => setRequest((current) => ({ id, count: (current?.count ?? 0) + 1 })),
    [],
  );
}
