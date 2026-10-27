import type { Metadata } from "next";
import { adminConfigured, isAdmin } from "@/lib/adminAuth";
import { todayIST } from "@/lib/goldRate";
import { listRates, storageReady } from "@/lib/rateStore";
import { getSiteUrl } from "@/lib/seo";
import { BRAND } from "@/config/brand";
import { AdminLogin } from "./AdminLogin";
import { RateDesk } from "./RateDesk";

export const metadata: Metadata = {
  title: "Rate Desk",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * /admin — the shop's daily gold-rate desk. Not linked from the site.
 * Signed out: password form. Signed in: enter today's rate, get the poster.
 */
export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <AdminShell>
        <p className="font-sans text-body text-muted">
          The admin password is not set. Add <code className="text-gold">ADMIN_PASSWORD</code> in the
          Vercel project settings and redeploy.
        </p>
      </AdminShell>
    );
  }

  if (!isAdmin()) {
    return (
      <AdminShell>
        <AdminLogin />
      </AdminShell>
    );
  }

  return (
    <RateDesk
      initialRates={await listRates(60)}
      today={todayIST()}
      storageReady={storageReady()}
      siteUrl={getSiteUrl(BRAND)}
    />
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-card border border-gold/25 bg-white/[0.03] p-8 shadow-2xl shadow-black/50">
        <p className="label-eyebrow">Rate Desk</p>
        <h1 className="mt-2 font-display text-display-m text-gold-sweep">Bright Gold</h1>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
