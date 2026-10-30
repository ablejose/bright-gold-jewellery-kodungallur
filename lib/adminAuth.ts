import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/**
 * Single-password admin login for the shop staff.
 *
 * The password lives only in the ADMIN_PASSWORD environment variable. The
 * session cookie holds an HMAC of it keyed with ADMIN_SESSION_SECRET (a long
 * random value that is never shown), so a short PIN cannot be used to forge a
 * cookie offline, and changing either value in Vercel signs everyone out. No
 * user database is needed for one shop.
 *
 * In production the secret is required; without it the admin stays closed
 * rather than falling back to a cookie anyone could compute from the PIN.
 */

export const ADMIN_COOKIE = "bg_admin";
const SESSION_DAYS = 30;

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET ?? "";
}

function sessionToken(password: string): string {
  return createHmac("sha256", `${sessionSecret()}:${password}`).update("bright-gold-admin-session").digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function adminConfigured(): boolean {
  if (!process.env.ADMIN_PASSWORD) return false;
  return process.env.NODE_ENV !== "production" || sessionSecret().length >= 16;
}

export function checkPassword(candidate: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  return Boolean(password) && safeEqual(candidate, password as string);
}

export function isAdmin(): boolean {
  const password = process.env.ADMIN_PASSWORD;
  const value = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(password && value) && safeEqual(value as string, sessionToken(password as string));
}

export function startSession(): void {
  cookies().set(ADMIN_COOKIE, sessionToken(process.env.ADMIN_PASSWORD as string), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export function endSession(): void {
  cookies().delete(ADMIN_COOKIE);
}
