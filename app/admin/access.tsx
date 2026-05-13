export type AdminSearchParams = Promise<{
  key?: string;
}>;

export async function readAdminKey(searchParams: AdminSearchParams) {
  const { key = "" } = await searchParams;
  return key;
}

export function hasAdminAccess(key: string) {
  const requiredKey = process.env.ADMIN_DASHBOARD_KEY;
  return requiredKey ? key === requiredKey : process.env.NODE_ENV !== "production";
}

export function AdminLocked() {
  return (
    <section className="mx-auto grid max-w-md gap-5 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
        Amanicare Admin
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">Admin access required</h1>
      <p className="text-sm leading-6 text-zinc-600">
        Set `ADMIN_DASHBOARD_KEY` and open `/admin?key=YOUR_KEY`. In production,
        this dashboard stays locked until that key exists.
      </p>
    </section>
  );
}

export function DevelopmentAccessNotice() {
  if (process.env.ADMIN_DASHBOARD_KEY) {
    return null;
  }

  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
      Development access is open. Set `ADMIN_DASHBOARD_KEY` before production.
    </p>
  );
}
