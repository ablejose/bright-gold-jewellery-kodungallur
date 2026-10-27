import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/adminAuth";
import { isIsoDate } from "@/lib/goldRate";
import { deleteRate, saveRate } from "@/lib/rateStore";
import type { GoldRate } from "@/types/goldRate";

/** Parse an optional positive rupee amount; undefined when left blank. */
function amount(value: unknown): number | undefined | "invalid" {
  if (value === undefined || value === null || value === "") return undefined;
  const number = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(number) && number > 0 && number < 10_000_000 ? number : "invalid";
}

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/gold-rate");
}

/** Save (create or overwrite) one day's rate. */
export async function POST(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const date = String(body.date ?? "");
  if (!isIsoDate(date)) return NextResponse.json({ error: "Pick a valid date." }, { status: 400 });

  const fields = {
    gold22: amount(body.gold22),
    gold18: amount(body.gold18),
    gold24: amount(body.gold24),
    silver: amount(body.silver),
  };
  if (fields.gold22 === undefined) {
    return NextResponse.json({ error: "22K rate is required." }, { status: 400 });
  }
  const bad = Object.entries(fields).find(([, value]) => value === "invalid");
  if (bad) return NextResponse.json({ error: `Check the ${bad[0]} amount.` }, { status: 400 });

  const note = String(body.note ?? "").trim().slice(0, 80);
  const rate: GoldRate = {
    date,
    gold22: fields.gold22 as number,
    ...(fields.gold18 ? { gold18: fields.gold18 as number } : {}),
    ...(fields.gold24 ? { gold24: fields.gold24 as number } : {}),
    ...(fields.silver ? { silver: fields.silver as number } : {}),
    ...(note ? { note } : {}),
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveRate(rate);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
  refreshPublicPages();
  return NextResponse.json({ rate });
}

/** Remove one day's rate: DELETE /api/admin/rates?date=YYYY-MM-DD */
export async function DELETE(request: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const date = new URL(request.url).searchParams.get("date") ?? "";
  if (!isIsoDate(date)) return NextResponse.json({ error: "Pick a valid date." }, { status: 400 });
  try {
    await deleteRate(date);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
  refreshPublicPages();
  return NextResponse.json({ ok: true });
}
