import { loginAdmin } from "@/app/admin/actions";
import {
  hasAdminLoginConfigured,
  isAdminSignedIn,
} from "@/lib/admin-auth";

export type AdminSearchParams = Promise<{
  key?: string;
  error?: string;
}>;

export async function readAdminAccessParams(searchParams: AdminSearchParams) {
  const { key = "", error = "" } = await searchParams;
  return { key, error };
}

export async function hasAdminAccess(key: string) {
  if (await isAdminSignedIn()) {
    return true;
  }

  const requiredKey = process.env.ADMIN_DASHBOARD_KEY;
  if (requiredKey) {
    return key === requiredKey;
  }

  if (await hasAdminLoginConfigured()) {
    return false;
  }

  return process.env.NODE_ENV !== "production";
}

export async function AdminLocked({ error }: { error?: string }) {
  const loginConfigured = await hasAdminLoginConfigured();

  return (
    <section className="mx-auto grid max-w-md gap-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        Amanicare Admin
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Admin access required</h1>
      {loginConfigured ? (
        <form action={loginAdmin} className="grid gap-3">
          <label className="grid gap-1 text-sm font-medium text-zinc-800">
            Email
            <input
              autoComplete="email"
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              name="email"
              required
              type="email"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-zinc-800">
            Password
            <input
              autoComplete="current-password"
              className="min-h-11 rounded-md border border-zinc-300 bg-white px-3 text-base text-zinc-950 outline-none transition focus:border-teal-700 focus:ring-2 focus:ring-teal-100"
              name="password"
              required
              type="password"
            />
          </label>
          {error === "invalid" ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              Email or password is incorrect.
            </p>
          ) : null}
          <button
            className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
            type="submit"
          >
            Sign in
          </button>
        </form>
      ) : (
        <p className="text-sm leading-6 text-zinc-600">
          Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to enable email/password login,
          or set `ADMIN_DASHBOARD_KEY` and open `/admin?key=YOUR_KEY`.
          In production, this dashboard stays locked until one of those access
          methods is configured.
        </p>
      )}
    </section>
  );
}

export async function DevelopmentAccessNotice() {
  if (process.env.ADMIN_DASHBOARD_KEY || (await hasAdminLoginConfigured())) {
    return null;
  }

  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
      Development access is open. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` before production.
    </p>
  );
}
