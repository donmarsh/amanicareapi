import { connection } from "next/server";

import {
  AdminLocked,
  type AdminSearchParams,
  hasAdminAccess,
  readAdminAccessParams,
} from "@/app/admin/access";
import { createWellnessArticle } from "@/app/admin/actions";
import {
  Button,
  Field,
  formatDate,
  HiddenAdminKey,
  HiddenReturnTo,
  PageHeader,
  TextArea,
} from "@/app/admin/ui";
import { prisma } from "@/lib/prisma";

type ArticlesPageProps = {
  searchParams: AdminSearchParams;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  await connection();

  const { key, error } = await readAdminAccessParams(searchParams);

  if (!(await hasAdminAccess(key))) {
    return <AdminLocked error={error} />;
  }

  const articles = await prisma.wellnessArticle.findMany({
    include: {
      translations: {
        orderBy: {
          locale: "asc",
        },
      },
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        eyebrow="Articles"
        title="Wellness articles"
        description="Publish practical safety, grounding, and self-care content for the Android app's wellness section."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(360px,0.75fr)_minmax(0,1.25fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-xl font-semibold tracking-tight">Add wellness article</h2>
          <form action={createWellnessArticle} className="mt-4 grid gap-3">
            <HiddenAdminKey value={key} />
            <HiddenReturnTo value="/admin/articles" />
            <Field label="Slug" name="slug" required />
            <Field label="Title" name="title" required />
            <Field label="Tag" name="tag" />
            <Field label="Image URL" name="imageUrl" />
            <TextArea label="Excerpt" name="excerpt" required />
            <TextArea label="Body" name="body" required rows={8} />
            <Button>Publish article</Button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Published content</h2>
            <p className="text-sm text-zinc-500">{articles.length} articles</p>
          </div>
          <div className="mt-4 grid gap-3">
            {articles.map((article) => (
              <article key={article.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-950">{article.title}</h3>
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                    {article.tag || "Untagged"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{article.excerpt}</p>
                <dl className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-zinc-900">Slug</dt>
                    <dd>{article.slug}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Published</dt>
                    <dd>{formatDate(article.publishedAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-zinc-900">Translations</dt>
                    <dd>
                      {article.translations.length
                        ? article.translations.map((translation) => translation.locale).join(", ")
                        : "None"}
                    </dd>
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
