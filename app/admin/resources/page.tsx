import { connection } from "next/server";

import {
  AdminLocked,
  type AdminSearchParams,
  hasAdminAccess,
  readAdminAccessParams,
} from "@/app/admin/access";
import { createResource, createResourceCategory } from "@/app/admin/actions";
import {
  Button,
  Field,
  formatDate,
  HiddenAdminKey,
  HiddenReturnTo,
  PageHeader,
  Select,
  TextArea,
} from "@/app/admin/ui";
import { prisma } from "@/lib/prisma";

type ResourcesPageProps = {
  searchParams: AdminSearchParams;
};

export default async function ResourcesPage({ searchParams }: ResourcesPageProps) {
  await connection();

  const { key, error } = await readAdminAccessParams(searchParams);

  if (!(await hasAdminAccess(key))) {
    return <AdminLocked error={error} />;
  }

  const [categories, resources] = await Promise.all([
    prisma.resourceCategory.findMany({
      include: {
        _count: {
          select: {
            resources: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.resource.findMany({
      include: {
        category: true,
      },
      orderBy: [{ isUrgent: "desc" }, { name: "asc" }],
    }),
  ]);

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Resources"
        title="Resource directory"
        description="Add safe services, emergency contacts, regional support providers, and categories used by the mobile app."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(380px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid content-start gap-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight">Add resource</h2>
            <form action={createResource} className="mt-4 grid gap-3">
              <HiddenAdminKey value={key} />
              <HiddenReturnTo value="/admin/resources" />
              <Field label="Slug" name="slug" required placeholder="safe-housing-nairobi" />
              <Field label="Name" name="name" required />
              <TextArea label="Summary" name="summary" required />
              <Select label="Category" name="categoryId" options={categoryOptions} required />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Region" name="region" />
                <Field label="Phone" name="phone" />
              </div>
              <Field label="Address" name="address" />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" />
                <Field label="Website" name="websiteUrl" type="url" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Latitude" name="latitude" />
                <Field label="Longitude" name="longitude" />
              </div>
              <TextArea label="Anonymity notes" name="anonymityNotes" />
              <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-zinc-800">
                <input className="size-4 accent-teal-700" name="isUrgent" type="checkbox" />
                Mark as urgent
              </label>
              <Button>Create resource</Button>
            </form>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-xl font-semibold tracking-tight">Add category</h2>
            <form action={createResourceCategory} className="mt-4 grid gap-3">
              <HiddenAdminKey value={key} />
              <HiddenReturnTo value="/admin/resources" />
              <Field label="Slug" name="slug" required placeholder="housing-support" />
              <Field label="Name" name="name" required />
              <Field label="Icon name" name="icon" placeholder="home" />
              <Field label="Sort order" name="sortOrder" type="number" />
              <TextArea label="Description" name="description" />
              <Button>Create category</Button>
            </form>
          </section>
        </div>

        <div className="grid content-start gap-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Resources</h2>
              <p className="text-sm text-zinc-500">{resources.length} total</p>
            </div>
            <div className="mt-4 grid gap-3">
              {resources.map((resource) => (
                <article key={resource.id} className="rounded-lg border border-zinc-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-zinc-950">{resource.name}</h3>
                    <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                      {resource.category.name}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{resource.summary}</p>
                  <dl className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-zinc-900">Region</dt>
                      <dd>{resource.region || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Urgent</dt>
                      <dd>{resource.isUrgent ? "Yes" : "No"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Phone</dt>
                      <dd>{resource.phone || "Not set"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Updated</dt>
                      <dd>{formatDate(resource.updatedAt)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Categories</h2>
              <p className="text-sm text-zinc-500">{categories.length} total</p>
            </div>
            <ul className="mt-4 grid gap-2 text-sm text-zinc-700">
              {categories.map((category) => (
                <li
                  key={category.id}
                  className="flex flex-col gap-1 rounded-md border border-zinc-200 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-zinc-950">{category.name}</span>
                  <span>
                    {category.slug} · {category._count.resources} resources
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </>
  );
}
