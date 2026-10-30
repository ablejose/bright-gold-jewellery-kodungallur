import { NextResponse } from "next/server";
import { isIsoDate, todayIST } from "@/lib/goldRate";
import { getLatestRate, getPreviousRate, getRate } from "@/lib/rateStore";

export const dynamic = "force-dynamic";

/**
 * Public read of the published rates (the same numbers the site shows).
 *   /api/rates                 latest rate on or before today, plus the one before it
 *   /api/rates?date=YYYY-MM-DD that day's rate, plus the one before it
 * The poster route (edge runtime, no filesystem) reads through this.
 */
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date");
  const rate = date && isIsoDate(date) ? await getRate(date) : await getLatestRate(todayIST());
  const previous = rate ? await getPreviousRate(rate.date) : null;
  return NextResponse.json({ rate, previous }, { headers: { "Cache-Control": "no-store" } });
}
