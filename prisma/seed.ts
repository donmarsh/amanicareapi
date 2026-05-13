import "dotenv/config";
import { createHash } from "node:crypto";

import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";
import { parseMariaDbUrl } from "../lib/database-url";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(parseMariaDbUrl(databaseUrl)),
});

const TEST_SESSION_TOKEN = "amanicare-mobile-test-token";

async function main() {
  await seedResourceCategories();
  await seedResources();
  await seedWellnessArticles();
  await seedTestUser();

  console.log("Seed complete.");
  console.log(`Mobile test username: mobile_test_user`);
  console.log(`Mobile test bearer token: ${TEST_SESSION_TOKEN}`);
}

async function seedResourceCategories() {
  const categories = [
    {
      slug: "legal-aid",
      name: "Legal Aid",
      description: "Confidential legal guidance, rights information, and documentation support.",
      icon: "gavel",
      sortOrder: 10,
      sw: {
        name: "Msaada wa Kisheria",
        description: "Ushauri wa siri wa kisheria, taarifa za haki, na msaada wa nyaraka.",
      },
    },
    {
      slug: "health-services",
      name: "Health Services",
      description: "Medical care, clinics, and health referrals.",
      icon: "briefcase-medical",
      sortOrder: 20,
      sw: {
        name: "Huduma za Afya",
        description: "Huduma za matibabu, kliniki, na rufaa za afya.",
      },
    },
    {
      slug: "education",
      name: "Education",
      description: "School access, scholarships, tutoring, and learning support.",
      icon: "graduation-cap",
      sortOrder: 30,
      sw: {
        name: "Elimu",
        description: "Upatikanaji wa shule, ufadhili, mafunzo, na msaada wa kujifunza.",
      },
    },
    {
      slug: "housing",
      name: "Housing",
      description: "Shelter, temporary housing, and relocation support.",
      icon: "house",
      sortOrder: 40,
      sw: {
        name: "Makazi",
        description: "Hifadhi, makazi ya muda, na msaada wa kuhama.",
      },
    },
    {
      slug: "community",
      name: "Community",
      description: "Support groups, peer networks, and local community programs.",
      icon: "users",
      sortOrder: 50,
      sw: {
        name: "Jamii",
        description: "Vikundi vya msaada, mitandao ya rika, na programu za jamii.",
      },
    },
    {
      slug: "translation",
      name: "Translation",
      description: "Language interpretation and document translation.",
      icon: "languages",
      sortOrder: 60,
      sw: {
        name: "Tafsiri",
        description: "Ukalimani wa lugha na tafsiri ya nyaraka.",
      },
    },
  ];

  for (const category of categories) {
    const saved = await prisma.resourceCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        icon: category.icon,
        sortOrder: category.sortOrder,
      },
    });

    await prisma.resourceCategoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId: saved.id,
          locale: "sw",
        },
      },
      update: category.sw,
      create: {
        categoryId: saved.id,
        locale: "sw",
        ...category.sw,
      },
    });
  }
}

async function seedResources() {
  const categoryBySlug = await getCategoryIds();
  const resources = [
    {
      slug: "safe-haven-collective",
      categorySlug: "community",
      name: "Safe Haven Collective",
      summary: "Peer-led support circles for displaced families with strict privacy practices.",
      address: "Confidential meeting points shared after intake",
      region: "Nairobi",
      phone: "+254700000101",
      email: "support@safehaven.example",
      websiteUrl: "https://safehaven.example",
      isUrgent: false,
      anonymityNotes: "Uses first-name or chosen-name check-in only.",
      sw: {
        name: "Safe Haven Collective",
        summary: "Vikundi vya msaada vinavyoongozwa na rika kwa familia zilizohama, kwa ulinzi mkali wa faragha.",
        address: "Maeneo ya mkutano hutolewa baada ya usajili wa siri",
        anonymityNotes: "Hutumia jina la kwanza au jina ulilochagua pekee.",
      },
    },
    {
      slug: "health-bridge-hub",
      categorySlug: "health-services",
      name: "Health Bridge Hub",
      summary: "Anonymous medical assistance, basic triage, and safe clinic referrals.",
      address: "Westlands, Nairobi",
      region: "Nairobi",
      phone: "+254700000202",
      email: "care@healthbridge.example",
      websiteUrl: "https://healthbridge.example",
      isUrgent: false,
      anonymityNotes: "Does not require government ID for initial consultation.",
      sw: {
        name: "Health Bridge Hub",
        summary: "Msaada wa matibabu bila kutaja jina, uchunguzi wa awali, na rufaa salama za kliniki.",
        address: "Westlands, Nairobi",
        anonymityNotes: "Haihitaji kitambulisho cha serikali kwa ushauri wa kwanza.",
      },
    },
    {
      slug: "rapid-response-hotline",
      categorySlug: "legal-aid",
      name: "Rapid Response Hotline",
      summary: "Urgent safety planning and rights guidance for people in immediate risk.",
      address: "Phone support available countrywide",
      region: "Kenya",
      phone: "+254700000303",
      email: "hotline@rapidresponse.example",
      websiteUrl: "https://rapidresponse.example",
      isUrgent: true,
      anonymityNotes: "Callers may use a chosen name and request no callback.",
      sw: {
        name: "Nambari ya Msaada wa Dharura",
        summary: "Mipango ya usalama wa dharura na mwongozo wa haki kwa watu walio katika hatari ya haraka.",
        address: "Msaada kwa simu unapatikana kote nchini",
        anonymityNotes: "Mpigaji anaweza kutumia jina alilochagua na kukataa kupigiwa tena.",
      },
    },
    {
      slug: "new-start-housing-desk",
      categorySlug: "housing",
      name: "New Start Housing Desk",
      summary: "Short-term shelter placement and relocation planning for families.",
      address: "Kilimani intake office",
      region: "Nairobi",
      phone: "+254700000404",
      email: "housing@newstart.example",
      websiteUrl: "https://newstart.example",
      isUrgent: false,
      anonymityNotes: "Only minimum details are collected for placement.",
      sw: {
        name: "Dawati la Makazi la New Start",
        summary: "Upangaji wa makazi ya muda mfupi na mipango ya kuhama kwa familia.",
        address: "Ofisi ya usajili Kilimani",
        anonymityNotes: "Taarifa chache muhimu pekee hukusanywa kwa upangaji.",
      },
    },
    {
      slug: "language-access-line",
      categorySlug: "translation",
      name: "Language Access Line",
      summary: "Remote interpretation for support calls, forms, and service referrals.",
      address: "Remote service",
      region: "Kenya",
      phone: "+254700000505",
      email: "translate@accessline.example",
      websiteUrl: "https://accessline.example",
      isUrgent: false,
      anonymityNotes: "Interpreters follow a confidentiality agreement.",
      sw: {
        name: "Huduma ya Ufikivu wa Lugha",
        summary: "Ukalimani wa mbali kwa simu za msaada, fomu, na rufaa za huduma.",
        address: "Huduma ya mbali",
        anonymityNotes: "Wakalimani hufuata makubaliano ya usiri.",
      },
    },
    {
      slug: "learning-pathways",
      categorySlug: "education",
      name: "Learning Pathways",
      summary: "Education placement support and tutoring for disrupted learners.",
      address: "Community partner centers",
      region: "Nairobi",
      phone: "+254700000606",
      email: "learn@pathways.example",
      websiteUrl: "https://pathways.example",
      isUrgent: false,
      anonymityNotes: "Student records are shared only with consent.",
      sw: {
        name: "Njia za Kujifunza",
        summary: "Msaada wa nafasi za elimu na mafunzo kwa wanafunzi waliokatizwa masomo.",
        address: "Vituo washirika vya jamii",
        anonymityNotes: "Rekodi za mwanafunzi hushirikiwa tu kwa idhini.",
      },
    },
  ];

  for (const resource of resources) {
    const saved = await prisma.resource.upsert({
      where: { slug: resource.slug },
      update: {
        categoryId: categoryBySlug[resource.categorySlug],
        name: resource.name,
        summary: resource.summary,
        address: resource.address,
        region: resource.region,
        phone: resource.phone,
        email: resource.email,
        websiteUrl: resource.websiteUrl,
        isUrgent: resource.isUrgent,
        anonymityNotes: resource.anonymityNotes,
      },
      create: {
        slug: resource.slug,
        categoryId: categoryBySlug[resource.categorySlug],
        name: resource.name,
        summary: resource.summary,
        address: resource.address,
        region: resource.region,
        phone: resource.phone,
        email: resource.email,
        websiteUrl: resource.websiteUrl,
        isUrgent: resource.isUrgent,
        anonymityNotes: resource.anonymityNotes,
      },
    });

    await prisma.resourceTranslation.upsert({
      where: {
        resourceId_locale: {
          resourceId: saved.id,
          locale: "sw",
        },
      },
      update: resource.sw,
      create: {
        resourceId: saved.id,
        locale: "sw",
        ...resource.sw,
      },
    });
  }
}

async function seedWellnessArticles() {
  const articles = [
    {
      slug: "grounding-techniques-for-stress",
      title: "Grounding techniques for moments of stress.",
      excerpt: "Simple ways to steady your breathing and attention when stress rises.",
      body: "Try naming five things you can see, four things you can feel, three things you can hear, two things you can smell, and one thing you can taste. Move slowly and breathe out longer than you breathe in.",
      tag: "Daily Wellness",
      imageUrl: "/wellness/grounding.jpg",
      sw: {
        title: "Mbinu za kutulia wakati wa msongo.",
        excerpt: "Njia rahisi za kutuliza pumzi na mawazo msongo unapoongezeka.",
        body: "Jaribu kutaja vitu vitano unavyoweza kuona, vinne unavyoweza kuhisi, vitatu unavyoweza kusikia, viwili unavyoweza kunusa, na kimoja unachoweza kuonja. Songa polepole na toa pumzi kwa muda mrefu kuliko unavyovuta.",
        tag: "Ustawi wa Kila Siku",
      },
    },
    {
      slug: "making-a-quiet-safety-plan",
      title: "Making a quiet safety plan.",
      excerpt: "A private checklist for preparing support without drawing attention.",
      body: "Choose one trusted contact, memorize one important number, and identify a safe place you can reach quickly. Keep digital traces minimal and use Quick Exit when needed.",
      tag: "Safety Planning",
      imageUrl: "/wellness/safety-plan.jpg",
      sw: {
        title: "Kutengeneza mpango wa usalama kwa siri.",
        excerpt: "Orodha ya faragha ya kuandaa msaada bila kuvutia umakini.",
        body: "Chagua mtu mmoja unayemwamini, kariri nambari moja muhimu, na tambua mahali salama unapoweza kufika haraka. Punguza alama za kidijitali na tumia Quick Exit inapohitajika.",
        tag: "Mipango ya Usalama",
      },
    },
  ];

  for (const article of articles) {
    const saved = await prisma.wellnessArticle.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        tag: article.tag,
        imageUrl: article.imageUrl,
        publishedAt: new Date("2026-01-01T08:00:00.000Z"),
      },
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        tag: article.tag,
        imageUrl: article.imageUrl,
        publishedAt: new Date("2026-01-01T08:00:00.000Z"),
      },
    });

    await prisma.wellnessArticleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId: saved.id,
          locale: "sw",
        },
      },
      update: article.sw,
      create: {
        articleId: saved.id,
        locale: "sw",
        ...article.sw,
      },
    });
  }
}

async function seedTestUser() {
  const now = new Date();
  const user = await prisma.anonymousUser.upsert({
    where: { username: "mobile_test_user" },
    update: {
      displayName: "Mobile Test User",
      contactChannel: "EMAIL",
      maskedContact: "mo***@example.com",
      lastVerifiedAt: now,
    },
    create: {
      username: "mobile_test_user",
      displayName: "Mobile Test User",
      contactChannel: "EMAIL",
      contactHash: sha256("seed:mobile@example.com"),
      maskedContact: "mo***@example.com",
      lastVerifiedAt: now,
    },
  });

  await prisma.session.upsert({
    where: { tokenHash: sha256(TEST_SESSION_TOKEN) },
    update: {
      userId: user.id,
      expiresAt: addDays(now, 30),
      revokedAt: null,
    },
    create: {
      tokenHash: sha256(TEST_SESSION_TOKEN),
      userId: user.id,
      expiresAt: addDays(now, 30),
      userAgentHash: sha256("amanicare-mobile-seed"),
      ipHash: sha256("127.0.0.1"),
    },
  });

  await prisma.helpRequest.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.chatSession.deleteMany({
    where: {
      userId: user.id,
    },
  });

  await prisma.helpRequest.create({
    data: {
      userId: user.id,
      needType: "COUNSELING",
      status: "SUBMITTED",
      description: "I need confidential emotional support and local referral options.",
      locationText: "Nairobi",
      preferredContact: "IN_APP",
      safeToContact: false,
      severity: "MEDIUM",
      submittedAt: now,
    },
  });

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: user.id,
      subject: "Local support groups",
      expiresAt: addDays(now, 1),
    },
  });

  await prisma.chatMessage.createMany({
    data: [
      {
        chatSessionId: chatSession.id,
        senderRole: "SUPPORT",
        body: "Hello. You are now connected to Amanicare support. This space is safe and anonymous.",
      },
      {
        chatSessionId: chatSession.id,
        senderRole: "USER",
        body: "I am looking for local support groups for recently displaced families in my area.",
      },
      {
        chatSessionId: chatSession.id,
        senderRole: "SUPPORT",
        body: "We understand. Safe Haven Collective and Health Bridge Hub may be useful starting points.",
      },
    ],
  });
}

async function getCategoryIds() {
  const categories = await prisma.resourceCategory.findMany({
    select: {
      id: true,
      slug: true,
    },
  });

  return Object.fromEntries(categories.map((category) => [category.slug, category.id]));
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
