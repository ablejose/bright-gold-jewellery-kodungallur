import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, endSession, startSession } from "@/lib/adminAuth";
import { clearFailures, lockedFor, recordFailure, visitorKey } from "@/lib/loginThrottle";

/** POST { password } signs in; DELETE signs out. */
export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin password is not set on the server." }, { status: 503 });
  }

  const visitor = visitorKey(request);
  const wait = lockedFor(visitor);
  if (wait > 0) {
    return NextResponse.json(
      { error: `Too many wrong tries. Try again in ${Math.ceil(wait / 60)} minutes.` },
      { status: 429, headers: { "Retry-After": String(wait) } },
    );
  }

  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    await recordFailure(visitor);
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  clearFailures(visitor);
  startSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  endSession();
  return NextResponse.json({ ok: true });
}
