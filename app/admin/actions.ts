"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  ChatSessionStatus,
  HelpRequestStatus,
  IncidentSeverity,
} from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

const HELP_STATUSES = new Set(["DRAFT", "SUBMITTED", "TRIAGED", "CLOSED"]);
const CHAT_STATUSES = new Set(["OPEN", "CLOSED", "EXPIRED"]);
const SEVERITIES = new Set(["LOW", "MEDIUM", "HIGH", "IMMEDIATE_DANGER"]);

function readField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getAdminKey(formData: FormData) {
  return readField(formData, "adminKey");
}

function requireAdminAccess(formData: FormData) {
  const expectedKey = process.env.ADMIN_DASHBOARD_KEY;

  if (!expectedKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Set ADMIN_DASHBOARD_KEY before using the admin dashboard.");
    }

    return;
  }

  if (getAdminKey(formData) !== expectedKey) {
    throw new Error("Admin access key is invalid.");
  }
}

function adminPath(formData: FormData) {
  const key = getAdminKey(formData);
  const returnTo = readField(formData, "returnTo") || "/admin";
  const path = returnTo.startsWith("/admin") ? returnTo : "/admin";

  return key ? `${path}?key=${encodeURIComponent(key)}` : path;
}

function emptyToNull(value: string) {
  return value ? value : null;
}

export async function createResourceCategory(formData: FormData) {
  requireAdminAccess(formData);

  const slug = readField(formData, "slug").toLowerCase();
  const name = readField(formData, "name");

  if (!slug || !name) {
    throw new Error("Category slug and name are required.");
  }

  await prisma.resourceCategory.create({
    data: {
      slug,
      name,
      description: emptyToNull(readField(formData, "description")),
      icon: emptyToNull(readField(formData, "icon")),
      sortOrder: Number(readField(formData, "sortOrder") || 0),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/resources");
  redirect(adminPath(formData));
}

export async function createResource(formData: FormData) {
  requireAdminAccess(formData);

  const slug = readField(formData, "slug").toLowerCase();
  const name = readField(formData, "name");
  const summary = readField(formData, "summary");
  const categoryId = readField(formData, "categoryId");
  const latitude = readField(formData, "latitude");
  const longitude = readField(formData, "longitude");

  if (!slug || !name || !summary || !categoryId) {
    throw new Error("Resource slug, name, summary, and category are required.");
  }

  await prisma.resource.create({
    data: {
      slug,
      name,
      summary,
      categoryId,
      region: emptyToNull(readField(formData, "region")),
      address: emptyToNull(readField(formData, "address")),
      phone: emptyToNull(readField(formData, "phone")),
      email: emptyToNull(readField(formData, "email")),
      websiteUrl: emptyToNull(readField(formData, "websiteUrl")),
      isUrgent: readField(formData, "isUrgent") === "on",
      anonymityNotes: emptyToNull(readField(formData, "anonymityNotes")),
      latitude: latitude || null,
      longitude: longitude || null,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/resources");
  revalidatePath("/api/resources");
  redirect(adminPath(formData));
}

export async function createWellnessArticle(formData: FormData) {
  requireAdminAccess(formData);

  const slug = readField(formData, "slug").toLowerCase();
  const title = readField(formData, "title");
  const excerpt = readField(formData, "excerpt");
  const body = readField(formData, "body");

  if (!slug || !title || !excerpt || !body) {
    throw new Error("Article slug, title, excerpt, and body are required.");
  }

  await prisma.wellnessArticle.create({
    data: {
      slug,
      title,
      excerpt,
      body,
      tag: emptyToNull(readField(formData, "tag")),
      imageUrl: emptyToNull(readField(formData, "imageUrl")),
      publishedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/articles");
  revalidatePath("/api/wellness");
  redirect(adminPath(formData));
}

export async function updateHelpRequestStatus(formData: FormData) {
  requireAdminAccess(formData);

  const id = readField(formData, "id");
  const status = readField(formData, "status").toUpperCase();

  if (!id || !HELP_STATUSES.has(status)) {
    throw new Error("Choose a valid help request and status.");
  }

  await prisma.helpRequest.update({
    where: {
      id,
    },
    data: {
      status: status as HelpRequestStatus,
      submittedAt: status === "SUBMITTED" ? new Date() : undefined,
    },
  });

  revalidatePath("/admin");
  redirect(adminPath(formData));
}

export async function updateHelpRequestSeverity(formData: FormData) {
  requireAdminAccess(formData);

  const id = readField(formData, "id");
  const severity = readField(formData, "severity").toUpperCase();

  if (!id || (severity && !SEVERITIES.has(severity))) {
    throw new Error("Choose a valid help request and severity.");
  }

  await prisma.helpRequest.update({
    where: {
      id,
    },
    data: {
      severity: severity ? (severity as IncidentSeverity) : null,
    },
  });

  revalidatePath("/admin");
  redirect(adminPath(formData));
}

export async function sendSupportMessage(formData: FormData) {
  requireAdminAccess(formData);

  const chatSessionId = readField(formData, "chatSessionId");
  const body = readField(formData, "body");

  if (!chatSessionId || !body) {
    throw new Error("Choose a chat session and enter a message.");
  }

  await prisma.chatMessage.create({
    data: {
      chatSessionId,
      senderRole: "SUPPORT",
      body,
    },
  });

  await prisma.chatSession.update({
    where: {
      id: chatSessionId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  redirect(adminPath(formData));
}

export async function updateChatSessionStatus(formData: FormData) {
  requireAdminAccess(formData);

  const id = readField(formData, "id");
  const status = readField(formData, "status").toUpperCase();

  if (!id || !CHAT_STATUSES.has(status)) {
    throw new Error("Choose a valid chat session and status.");
  }

  await prisma.chatSession.update({
    where: {
      id,
    },
    data: {
      status: status as ChatSessionStatus,
      closedAt: status === "CLOSED" ? new Date() : null,
    },
  });

  revalidatePath("/admin");
  redirect(adminPath(formData));
}
