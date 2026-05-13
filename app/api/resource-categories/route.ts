import { json } from "@/lib/api";
import { getRequestedLocale, localizeCategory } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const locale = getRequestedLocale(new URL(request.url));
  const categories = await prisma.resourceCategory.findMany({
    include: {
      translations: {
        where: {
          locale,
        },
      },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return json({
    locale,
    categories: categories.map((category) => localizeCategory(category, locale)),
  });
}
