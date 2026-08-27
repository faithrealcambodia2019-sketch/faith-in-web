"use client";

import { useState, type FormEvent } from "react";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

/** Firebase error codes are stable; the copy here is ours. */
function readableAuthError(code: string): string {
  switch (code) {
    case "auth/invalid-email":
      return "That email address does not look right.";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    case "auth/network-request-failed":
      return "Network problem. Check your connection and try again.";
    default:
      return "Could not sign you in. Please try again.";
  }
}

export function SignInPanel() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (cause) {
      const code = (cause as { code?: string })?.code ?? "";
      setError(readableAuthError(code));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const client = auth;
    if (!client) return;
    void run(() => signInWithEmailAndPassword(client, email.trim(), password));
  }

  function onGoogle() {
    const client = auth;
    if (!client) return;
    void run(() => signInWithPopup(client, new GoogleAuthProvider()));
  }

  return (
    <section className="card mx-auto mt-16 w-full max-w-[420px] p-6 sm:p-8">
      <h1 className="text-[22px] font-bold leading-tight">Welcome back</h1>
      <p className="mt-1.5 text-[14px] text-muted">
        Sign in to read Scripture, share blessings and pray with the community.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-[13px] font-semibold">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="field"
            placeholder="••••••••"
          />
        </label>

        {error ? (
          <p role="alert" className="text-[13px] font-medium text-[rgb(var(--fim-accent-rose))]">
            {error}
          </p>
        ) : null}

        <button type="submit" className="btn btn-primary w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[12px] text-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        className="btn btn-outline w-full"
        disabled={busy}
        onClick={onGoogle}
      >
        Continue with Google
      </button>
    </section>
  );
}
