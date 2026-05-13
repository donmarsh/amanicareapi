import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

import type { ContactChannel } from "@/generated/prisma/enums";

const CONTACT_HASH_PEPPER = process.env.CONTACT_HASH_PEPPER ?? "amanicare-dev-pepper";
const CODE_HASH_PEPPER = process.env.CODE_HASH_PEPPER ?? "amanicare-dev-code-pepper";

export function normalizeContact(contact: string): {
  channel: ContactChannel;
  normalized: string;
  masked: string;
} {
  const value = contact.trim().toLowerCase();

  if (value.includes("@")) {
    const [name = "", domain = ""] = value.split("@");
    return {
      channel: "EMAIL",
      normalized: value,
      masked: `${name.slice(0, 2)}***@${domain}`,
    };
  }

  const digits = value.replace(/[^\d+]/g, "");

  return {
    channel: "PHONE",
    normalized: digits,
    masked: `${digits.slice(0, 4)}***${digits.slice(-2)}`,
  };
}

export function hashContact(normalizedContact: string) {
  return sha256(`${CONTACT_HASH_PEPPER}:${normalizedContact}`);
}

export function hashCode(code: string, contactHash: string) {
  return sha256(`${CODE_HASH_PEPPER}:${contactHash}:${code}`);
}

export function hashToken(token: string) {
  return sha256(token);
}

export function generateOtpCode() {
  return randomInt(100000, 999999).toString();
}

export function generateSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashRequestValue(value: string | null) {
  if (!value) {
    return null;
  }

  return sha256(value);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function randomInt(min: number, max: number) {
  const span = max - min + 1;
  const bytes = randomBytes(4).readUInt32BE(0);
  return min + (bytes % span);
}
