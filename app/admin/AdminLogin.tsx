"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (response.ok) {
      router.refresh();
      return;
    }
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    setError(body.error ?? "Could not sign in.");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-2">
        <span className="font-sans text-caption uppercase tracking-[0.2em] text-muted">Password</span>
        <input
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-md border border-border bg-background px-4 py-3 font-sans text-body text-ivory outline-none transition-colors focus:border-gold"
        />
      </label>
      {error ? <p className="font-sans text-sm text-[#F28B8B]">{error}</p> : null}
      <button type="submit" disabled={busy || !password} className="btn-primary disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
