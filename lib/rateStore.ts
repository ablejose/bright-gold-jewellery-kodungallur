import { promises as fs } from "fs";
import path from "path";
import type { GoldRate } from "@/types/goldRate";

/**
 * Where the daily rates live.
 *
 * Production, either of:
 *  - Vercel Edge Config (free on Hobby, no redeploy when it changes): one item,
 *    "rates", holding the newest days. It is capped at 8 KB, so saving drops the
 *    oldest days instead of failing. EDGE_CONFIG (read connection string) is set
 *    when the store is connected to the project; saving also needs
 *    EDGE_CONFIG_WRITE_TOKEN (a Vercel API token) and EDGE_CONFIG_TEAM_ID.
 *  - An Upstash Redis database (Vercel Marketplace sets KV_REST_API_URL /
 *    KV_REST_API_TOKEN). All rates are one Redis hash keyed by date.
 *
 * Local development without Redis: a JSON file in .data/ (git-ignored).
 * Vercel's filesystem is read-only, so the file store never runs there.
 */

const HASH_KEY = "bright-gold:rates";
const LOCAL_FILE = path.join(process.cwd(), ".data", "gold-rates.json");

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

const EDGE_ITEM = "rates";
// Edge Config allows 8 KB per store; stay well under it and keep a useful window.
const EDGE_MAX_BYTES = 6000;
const EDGE_MAX_DAYS = 45;

function edgeRead(): { id: string; token: string } | null {
  const raw = process.env.EDGE_CONFIG;
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const id = url.pathname.replace(/^\//, "");
    const token = url.searchParams.get("token");
    return id && token ? { id, token } : null;
  } catch {
    return null;
  }
}

function edgeWrite(): { id: string; token: string; teamId?: string } | null {
  const read = edgeRead();
  const token = process.env.EDGE_CONFIG_WRITE_TOKEN;
  return read && token ? { id: read.id, token, teamId: process.env.EDGE_CONFIG_TEAM_ID } : null;
}

/** True when saving will work in this environment. */
export function storageReady(): boolean {
  return redisConfig() !== null || edgeWrite() !== null || process.env.VERCEL !== "1";
}

/** The newest days that fit in an Edge Config item. */
function trimForEdge(all: Record<string, GoldRate>): Record<string, GoldRate> {
  const dates = Object.keys(all).sort().reverse().slice(0, EDGE_MAX_DAYS);
  const kept: Record<string, GoldRate> = {};
  for (const date of dates) {
    kept[date] = all[date];
    if (JSON.stringify(kept).length > EDGE_MAX_BYTES) {
      delete kept[date];
      break;
    }
  }
  return kept;
}

async function edgeReadAll(fresh: boolean): Promise<Record<string, GoldRate>> {
  const write = edgeWrite();
  if (fresh && write) {
    // The management API sees a save at once; the public read endpoint can lag a few seconds.
    const query = write.teamId ? `?teamId=${write.teamId}` : "";
    const response = await fetch(`https://api.vercel.com/v1/edge-config/${write.id}/item/${EDGE_ITEM}${query}`, {
      headers: { Authorization: `Bearer ${write.token}` },
      cache: "no-store",
    });
    if (response.status === 404) return {};
    if (!response.ok) throw new Error(`Edge Config ${response.status}`);
    // The management API wraps the stored value ({ key, value, ... }) and sends no body when nothing is saved yet.
    const text = await response.text();
    return text ? ((JSON.parse(text) as { value?: Record<string, GoldRate> | null }).value ?? {}) : {};
  }
  const read = edgeRead();
  if (!read) return {};
  const response = await fetch(`https://edge-config.vercel.com/${read.id}/item/${EDGE_ITEM}?token=${read.token}`, {
    next: { revalidate: 60 },
  });
  if (!response.ok) return {};
  const text = await response.text();
  return text ? ((JSON.parse(text) as Record<string, GoldRate> | null) ?? {}) : {};
}

async function edgeWriteAll(all: Record<string, GoldRate>): Promise<void> {
  const write = edgeWrite();
  if (!write) throw new Error("Edge Config is not set up for saving.");
  const query = write.teamId ? `?teamId=${write.teamId}` : "";
  const response = await fetch(`https://api.vercel.com/v1/edge-config/${write.id}/items${query}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${write.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: EDGE_ITEM, value: trimForEdge(all) }] }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Edge Config save failed (${response.status})`);
}

async function redis<T>(command: (string | number)[]): Promise<T> {
  const config = redisConfig();
  if (!config) throw new Error("Redis is not configured");
  const response = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}` },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const body = (await response.json()) as { result?: T; error?: string };
  if (!response.ok || body.error) throw new Error(body.error ?? `Redis ${response.status}`);
  return body.result as T;
}

async function readAll(fresh = false): Promise<Record<string, GoldRate>> {
  if (!redisConfig() && edgeRead()) return edgeReadAll(fresh);
  if (redisConfig()) {
    // HGETALL returns a flat [field, value, field, value, ...] list.
    const flat = await redis<string[]>(["HGETALL", HASH_KEY]);
    const rates: Record<string, GoldRate> = {};
    for (let i = 0; i < flat.length; i += 2) rates[flat[i]] = JSON.parse(flat[i + 1]) as GoldRate;
    return rates;
  }
  // On Vercel there is no local store. A stray file in the deployment (such as a
  // developer's test rates) must never be published as the shop's real rates.
  if (process.env.VERCEL === "1") return {};
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Record<string, GoldRate>;
  } catch {
    return {};
  }
}

/** All saved rates, newest day first. */
export async function listRates(limit = 60, fresh = false): Promise<GoldRate[]> {
  const all = await readAll(fresh);
  return Object.values(all)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}

/** The rate for one day, if saved. */
export async function getRate(date: string): Promise<GoldRate | null> {
  if (redisConfig()) {
    const value = await redis<string | null>(["HGET", HASH_KEY, date]);
    return value ? (JSON.parse(value) as GoldRate) : null;
  }
  return (await readAll())[date] ?? null;
}

/** The most recent saved rate on or before `date` (defaults to any). */
export async function getLatestRate(onOrBefore?: string): Promise<GoldRate | null> {
  const rates = await listRates(400);
  return rates.find((rate) => !onOrBefore || rate.date <= onOrBefore) ?? null;
}

/** The saved rate immediately before `date`, for the up/down arrow. */
export async function getPreviousRate(date: string): Promise<GoldRate | null> {
  const rates = await listRates(400);
  return rates.find((rate) => rate.date < date) ?? null;
}

export async function saveRate(rate: GoldRate): Promise<void> {
  if (redisConfig()) {
    await redis(["HSET", HASH_KEY, rate.date, JSON.stringify(rate)]);
    return;
  }
  if (edgeWrite()) {
    const all = await edgeReadAll(true);
    all[rate.date] = rate;
    await edgeWriteAll(all);
    return;
  }
  if (process.env.VERCEL === "1") {
    throw new Error("Storage is not set up. Connect Vercel Edge Config or an Upstash Redis database.");
  }
  const all = await readAll();
  all[rate.date] = rate;
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2));
}

export async function deleteRate(date: string): Promise<void> {
  if (redisConfig()) {
    await redis(["HDEL", HASH_KEY, date]);
    return;
  }
  if (edgeWrite()) {
    const all = await edgeReadAll(true);
    delete all[date];
    await edgeWriteAll(all);
    return;
  }
  if (process.env.VERCEL === "1") {
    throw new Error("Storage is not set up. Connect Vercel Edge Config or an Upstash Redis database.");
  }
  const all = await readAll();
  delete all[date];
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2));
}
