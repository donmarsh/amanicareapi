import { NextResponse } from "next/server";

import { SESSION_COOKIE, getCurrentSession, json } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getCurrentSession();

  if (session) {
    await prisma.session.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export async function GET() {
  return json({ ok: true, action: "Use POST to revoke the current anonymous session." });
}
