import { addMinutes, badRequest, json, readString } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateOtpCode, hashCode, hashContact, normalizeContact } from "@/lib/privacy";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const contact = readString(body?.contact);

  if (!contact) {
    return badRequest("Provide an email address or telephone number.");
  }

  const normalized = normalizeContact(contact);
  const contactHash = hashContact(normalized.normalized);
  const code = generateOtpCode();

  await prisma.authCode.create({
    data: {
      contactChannel: normalized.channel,
      contactHash,
      codeHash: hashCode(code, contactHash),
      expiresAt: addMinutes(new Date(), 10),
    },
  });

  return json({
    ok: true,
    channel: normalized.channel,
    maskedContact: normalized.masked,
    expiresInSeconds: 600,
    delivery: {
      status: "queued",
      provider: "stub",
    },
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
}
