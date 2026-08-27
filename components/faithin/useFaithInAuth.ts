"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth, firebaseConfigured } from "@/lib/firebase";

export type AuthState =
  | { status: "loading"; user: null }
  | { status: "signed-out"; user: null }
  | { status: "signed-in"; user: User }
  | { status: "unavailable"; user: null };

/**
 * Subscribes to Firebase auth. `unavailable` means the public Firebase
 * configuration is missing from the environment, which is a deployment
 * problem rather than a signed-out user — the UI reports the two differently.
 */
export function useFaithInAuth(): AuthState {
  // Derived once: a missing configuration is knowable before the first paint,
  // so it does not need a state update from inside the effect.
  const [state, setState] = useState<AuthState>(() =>
    firebaseConfigured && auth
      ? { status: "loading", user: null }
      : { status: "unavailable", user: null },
  );

  useEffect(() => {
    const client = auth;
    if (!firebaseConfigured || !client) return;
    return onAuthStateChanged(client, (user) => {
      setState(user ? { status: "signed-in", user } : { status: "signed-out", user: null });
    });
  }, []);

  return state;
}

export async function signOutOfFaithIn(): Promise<void> {
  if (auth) await signOut(auth);
}
