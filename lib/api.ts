import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { hashRequestValue, hashToken } from "@/lib/privacy";

export const SESSION_COOKIE = "amanicare_session";

export function json(data: unknown, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return json({ error: { code: "BAD_REQUEST", message, details } }, { status: 400 });
}

export function unauthorized(message = "Authentication is required.") {
  return json({ error: { code: "UNAUTHORIZED", message } }, { status: 401 });
}

export function notFound(message = "Resource was not found.") {
  return json({ error: { code: "NOT_FOUND", message } }, { status: 404 });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authorization = headerStore.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
  const token = bearerToken ?? cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  return prisma.session.findFirst({
    where: {
      tokenHash: hashToken(token),
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });
}

export async function requireCurrentSession() {
  const session = await getCurrentSession();

  if (!session) {
    return { response: unauthorized() };
  }

  return { session };
}

export async function getRequestFingerprint() {
  const headerStore = await headers();
  return {
    ipHash: hashRequestValue(
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headerStore.get("x-real-ip"),
    ),
    userAgentHash: hashRequestValue(headerStore.get("user-agent")),
  };
}

export function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMinutes(date: Date, minutes: number) {
  const next = new Date(date);
  next.setMinutes(next.getMinutes() + minutes);
  return next;
}
