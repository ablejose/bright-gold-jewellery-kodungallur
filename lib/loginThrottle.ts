/**
 * Light brute-force protection for the admin login.
 *
 * A short PIN has only 10,000 possibilities, so wrong guesses are slowed down
 * and, after MAX_FAILS in WINDOW_MS, refused outright for that visitor. Counts
 * live in server memory (one serverless instance each), so this is a speed
 * bump, not a wall: a long password is still the real protection.
 */

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const FAIL_DELAY_MS = 800;

const failures = new Map<string, number[]>();

function recent(key: string, now: number): number[] {
  const list = (failures.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
  if (list.length) failures.set(key, list);
  else failures.delete(key);
  return list;
}

/** Seconds the visitor must wait, or 0 if they may try. */
export function lockedFor(key: string, now = Date.now()): number {
  const list = recent(key, now);
  if (list.length < MAX_FAILS) return 0;
  return Math.ceil((list[0] + WINDOW_MS - now) / 1000);
}

/** Record a wrong guess and make the caller wait before answering. */
export async function recordFailure(key: string, now = Date.now()): Promise<void> {
  failures.set(key, [...recent(key, now), now]);
  await new Promise((resolve) => setTimeout(resolve, FAIL_DELAY_MS));
}

export function clearFailures(key: string): void {
  failures.delete(key);
}

/** Who is asking: the first address in x-forwarded-for (set by Vercel), else a shared bucket. */
export function visitorKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}
