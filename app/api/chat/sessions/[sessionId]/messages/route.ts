import type { ChatSenderRole } from "@/generated/prisma/enums";

import { badRequest, json, notFound, readString, requireCurrentSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, ctx: RouteContext<"/api/chat/sessions/[sessionId]/messages">) {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const { sessionId } = await ctx.params;
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId: auth.session.userId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!chatSession) {
    return notFound("Chat session was not found.");
  }

  return json({ session: chatSession, messages: chatSession.messages });
}

export async function POST(request: Request, ctx: RouteContext<"/api/chat/sessions/[sessionId]/messages">) {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const message = readString(body?.message);
  const senderRole = (readString(body?.senderRole).toUpperCase() || "USER") as ChatSenderRole;

  if (!message) {
    return badRequest("Message is required.");
  }

  if (!["USER", "SUPPORT", "SYSTEM"].includes(senderRole)) {
    return badRequest("Choose a valid sender role.");
  }

  const { sessionId } = await ctx.params;
  const chatSession = await prisma.chatSession.findFirst({
    where: {
      id: sessionId,
      userId: auth.session.userId,
      status: "OPEN",
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!chatSession) {
    return notFound("Open chat session was not found.");
  }

  const created = await prisma.chatMessage.create({
    data: {
      chatSessionId: sessionId,
      senderRole,
      body: message,
    },
  });

  await prisma.chatSession.update({
    where: {
      id: sessionId,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  return json({ message: created }, { status: 201 });
}
