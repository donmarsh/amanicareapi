import { addDays, json, readString, requireCurrentSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const sessions = await prisma.chatSession.findMany({
    where: {
      userId: auth.session.userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return json({ sessions });
}

export async function POST(request: Request) {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);

  const chatSession = await prisma.chatSession.create({
    data: {
      userId: auth.session.userId,
      subject: readString(body?.subject) || null,
      expiresAt: addDays(new Date(), 1),
      messages: {
        create: {
          senderRole: "SYSTEM",
          body: "This anonymous support session has started.",
        },
      },
    },
    include: {
      messages: true,
    },
  });

  return json({ session: chatSession }, { status: 201 });
}
