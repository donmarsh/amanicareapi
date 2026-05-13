import { json } from "@/lib/api";
import { getRequestedLocale, localizeArticle } from "@/lib/localization";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const locale = getRequestedLocale(new URL(request.url));
  const articles = await prisma.wellnessArticle.findMany({
    where: {
      publishedAt: {
        lte: new Date(),
      },
    },
    include: {
      translations: {
        where: {
          locale,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });

  return json({
    locale,
    articles: articles.map((article) => localizeArticle(article, locale)),
  });
}
