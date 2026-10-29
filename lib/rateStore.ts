import { promises as fs } from "fs";
import path from "path";
import type { GoldRate } from "@/types/goldRate";

/**
 * Where the daily rates live.
 *
 * Production: an Upstash Redis database (add it from the Vercel Marketplace;
 * Vercel sets KV_REST_API_URL / KV_REST_API_TOKEN). All rates are one Redis
 * hash keyed by date, so a year is ~365 small fields.
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

/** True when saving will work in this environment. */
export function storageReady(): boolean {
  return redisConfig() !== null || process.env.VERCEL !== "1";
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

async function readAll(): Promise<Record<string, GoldRate>> {
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
export async function listRates(limit = 60): Promise<GoldRate[]> {
  const all = await readAll();
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
  if (process.env.VERCEL === "1") {
    throw new Error("Storage is not set up. Connect an Upstash Redis database in Vercel.");
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
  if (process.env.VERCEL === "1") {
    throw new Error("Storage is not set up. Connect an Upstash Redis database in Vercel.");
  }
  const all = await readAll();
  delete all[date];
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(all, null, 2));
}
