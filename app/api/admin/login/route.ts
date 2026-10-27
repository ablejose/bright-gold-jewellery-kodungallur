import { NextResponse } from "next/server";
import { adminConfigured, checkPassword, endSession, startSession } from "@/lib/adminAuth";

/** POST { password } signs in; DELETE signs out. */
export async function POST(request: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Admin password is not set on the server." }, { status: 503 });
  }
  const { password } = (await request.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  startSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  endSession();
  return NextResponse.json({ ok: true });
}
