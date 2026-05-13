const DEFAULT_LOCALE = "en";
const LOCALE_PATTERN = /^[a-z]{2,3}(-[A-Z]{2})?$/;

export function getRequestedLocale(url: URL) {
  const locale = url.searchParams.get("locale")?.trim() || DEFAULT_LOCALE;

  if (!LOCALE_PATTERN.test(locale)) {
    return DEFAULT_LOCALE;
  }

  return locale;
}

export function localizeArticle<
  T extends {
    defaultLocale: string;
    title: string;
    excerpt: string;
    body: string;
    tag: string | null;
    translations?: Array<{
      locale: string;
      title: string;
      excerpt: string;
      body: string;
      tag: string | null;
    }>;
  },
>(article: T, locale: string) {
  const translation = article.translations?.find((item) => item.locale === locale);

  return {
    ...article,
    locale: translation?.locale ?? article.defaultLocale,
    title: translation?.title ?? article.title,
    excerpt: translation?.excerpt ?? article.excerpt,
    body: translation?.body ?? article.body,
    tag: translation?.tag ?? article.tag,
    translations: undefined,
  };
}

export function localizeCategory<
  T extends {
    defaultLocale: string;
    name: string;
    description: string | null;
    translations?: Array<{
      locale: string;
      name: string;
      description: string | null;
    }>;
  },
>(category: T, locale: string) {
  const translation = category.translations?.find((item) => item.locale === locale);

  return {
    ...category,
    locale: translation?.locale ?? category.defaultLocale,
    name: translation?.name ?? category.name,
    description: translation?.description ?? category.description,
    translations: undefined,
  };
}

export function localizeResource<
  T extends {
    defaultLocale: string;
    name: string;
    summary: string;
    address: string | null;
    anonymityNotes: string | null;
    translations?: Array<{
      locale: string;
      name: string;
      summary: string;
      address: string | null;
      anonymityNotes: string | null;
    }>;
    category?: Parameters<typeof localizeCategory>[0];
  },
>(resource: T, locale: string) {
  const translation = resource.translations?.find((item) => item.locale === locale);

  return {
    ...resource,
    locale: translation?.locale ?? resource.defaultLocale,
    name: translation?.name ?? resource.name,
    summary: translation?.summary ?? resource.summary,
    address: translation?.address ?? resource.address,
    anonymityNotes: translation?.anonymityNotes ?? resource.anonymityNotes,
    category: resource.category ? localizeCategory(resource.category, locale) : undefined,
    translations: undefined,
  };
}
