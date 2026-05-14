import { connection } from "next/server";

import {
  AdminLocked,
  type AdminSearchParams,
  hasAdminAccess,
  readAdminAccessParams,
} from "@/app/admin/access";
import { createAdminUser } from "@/app/admin/actions";
import {
  adminRoles,
  Button,
  Field,
  formatDate,
  HiddenAdminKey,
  HiddenReturnTo,
  PageHeader,
  Select,
} from "@/app/admin/ui";
import { prisma } from "@/lib/prisma";

type SettingsPageProps = {
  searchParams: AdminSearchParams;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  await connection();

  const { key, error } = await readAdminAccessParams(searchParams);

  if (!(await hasAdminAccess(key))) {
    return <AdminLocked error={error} />;
  }

  const adminUsers = await prisma.adminUser.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Admin users"
        description="Create dashboard users and assign their access role."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.25fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-semibold tracking-tight">Create admin user</h2>
          <form action={createAdminUser} className="mt-4 grid gap-3">
            <HiddenAdminKey value={key} />
            <HiddenReturnTo value="/admin/settings" />
            <Field label="Name" name="name" />
            <Field label="Email" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required />
            <Select
              label="Role"
              name="role"
              defaultValue="SUPPORT"
              options={adminRoles.map((role) => ({ label: role, value: role }))}
              required
            />
            <Button>Create user</Button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Users</h2>
            <p className="text-sm text-zinc-500">{adminUsers.length} total</p>
          </div>
          <div className="mt-4 grid gap-3">
            {adminUsers.map((user) => (
              <article key={user.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-zinc-950">
                      {user.name || user.email}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
                  </div>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    {user.role}
                  </span>
                </div>
                <dl className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-zinc-900">Status</dt>
                    <dd>{user.isActive ? "Active" : "Inactive"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Created</dt>
                    <dd>{formatDate(user.createdAt)}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
