import { NextResponse } from "next/server";

import {
  SESSION_COOKIE,
  addDays,
  badRequest,
  getRequestFingerprint,
  readString,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  constantTimeEquals,
  generateSessionToken,
  hashCode,
  hashContact,
  hashToken,
  normalizeContact,
} from "@/lib/privacy";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const contact = readString(body?.contact);
  const code = readString(body?.code);
  const username = readString(body?.username);

  if (!contact || !code) {
    return badRequest("Contact and verification code are required.");
  }

  if (username && !USERNAME_PATTERN.test(username)) {
    return badRequest("Username must be 3-24 characters and use only letters, numbers, or underscores.");
  }

  const normalized = normalizeContact(contact);
  const contactHash = hashContact(normalized.normalized);
  const authCode = await prisma.authCode.findFirst({
    where: {
      contactHash,
      contactChannel: normalized.channel,
      consumedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!authCode) {
    return badRequest("The verification code is invalid or expired.");
  }

  if (authCode.attempts >= 5) {
    return badRequest("Too many attempts. Request a new code.");
  }

  const expectedHash = hashCode(code, contactHash);

  if (!constantTimeEquals(expectedHash, authCode.codeHash)) {
    await prisma.authCode.update({
      where: { id: authCode.id },
      data: { attempts: { increment: 1 } },
    });

    return badRequest("The verification code is invalid or expired.");
  }

  const sessionToken = generateSessionToken();
  const expiresAt = addDays(new Date(), 30);
  const fingerprint = await getRequestFingerprint();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.anonymousUser.findUnique({
        where: {
          contactHash,
        },
      });

      if (!existingUser && !username) {
        throw new Error("USERNAME_REQUIRED");
      }

      const user = existingUser
        ? await tx.anonymousUser.update({
            where: { id: existingUser.id },
            data: {
              username: username || existingUser.username,
              contactChannel: normalized.channel,
              maskedContact: normalized.masked,
              lastVerifiedAt: new Date(),
            },
          })
        : await tx.anonymousUser.create({
            data: {
              username,
              contactChannel: normalized.channel,
              contactHash,
              maskedContact: normalized.masked,
              lastVerifiedAt: new Date(),
            },
          });

      await tx.authCode.update({
        where: { id: authCode.id },
        data: {
          consumedAt: new Date(),
          userId: user.id,
        },
      });

      await tx.session.create({
        data: {
          tokenHash: hashToken(sessionToken),
          expiresAt,
          userAgentHash: fingerprint.userAgentHash,
          ipHash: fingerprint.ipHash,
          userId: user.id,
        },
      });

      return user;
    });

    const response = NextResponse.json({
      user: {
        id: result.id,
        username: result.username,
        maskedContact: result.maskedContact,
      },
      session: {
        token: sessionToken,
        expiresAt,
      },
    });

    response.cookies.set(SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: expiresAt,
      path: "/",
    });

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === "USERNAME_REQUIRED") {
      return badRequest("Choose an anonymous username to finish sign up.");
    }

    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return badRequest("That username is already in use.");
    }

    throw error;
  }
}
