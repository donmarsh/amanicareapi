import { json } from "@/lib/api";
import { getRequestedLocale, localizeResource } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const locale = getRequestedLocale(url);
  const category = url.searchParams.get("category");
  const urgent = url.searchParams.get("urgent");

  const resources = await prisma.resource.findMany({
    where: {
      category: category
        ? {
            slug: category,
          }
        : undefined,
      isUrgent: urgent === "true" ? true : undefined,
    },
    include: {
      category: {
        include: {
          translations: {
            where: {
              locale,
            },
          },
        },
      },
      translations: {
        where: {
          locale,
        },
      },
    },
    orderBy: [{ isUrgent: "desc" }, { name: "asc" }],
  });

  return json({
    locale,
    resources: resources.map((resource) => localizeResource(resource, locale)),
  });
}
