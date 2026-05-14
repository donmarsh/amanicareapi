import {
  createHash,
  createHmac,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";

const ADMIN_AUTH_COOKIE = "amanicare_admin";
const ADMIN_AUTH_MAX_AGE = 60 * 60 * 8;
const PASSWORD_HASH_PREFIX = "scrypt";
const SCRYPT_KEY_LENGTH = 64;

const scrypt = promisify(scryptCallback);

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getAuthSecret() {
  return (
    process.env.ADMIN_AUTH_SECRET ??
    process.env.CODE_HASH_PEPPER ??
    process.env.ADMIN_DASHBOARD_KEY ??
    "amanicare-dev-admin-secret"
  );
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";

  return {
    email,
    password,
    isConfigured: Boolean(email && password),
  };
}

function getEnvAdminToken() {
  const { email, password, isConfigured } = getAdminCredentials();

  if (!isConfigured) {
    return "";
  }

  return `env:${sha256(`${getAuthSecret()}:${email}:${password}`)}`;
}

function signAdminUserCookie(userId: string, passwordHash: string) {
  return createHmac("sha256", getAuthSecret())
    .update(`${userId}:${passwordHash}`)
    .digest("hex");
}

function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: ADMIN_AUTH_MAX_AGE,
  };
}

async function verifyEnvCredentials(email: string, password: string) {
  const credentials = getAdminCredentials();

  if (!credentials.isConfigured) {
    return false;
  }

  return (
    safeEquals(email.trim().toLowerCase(), credentials.email) &&
    safeEquals(password, credentials.password)
  );
}

export function isAdminPasswordConfigured() {
  return getAdminCredentials().isConfigured;
}

export async function hasAdminUsers() {
  const total = await prisma.adminUser.count({
    where: {
      isActive: true,
    },
  });

  return total > 0;
}

export async function hasAdminLoginConfigured() {
  return isAdminPasswordConfigured() || (await hasAdminUsers());
}

export async function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return `${PASSWORD_HASH_PREFIX}:${salt}:${key.toString("hex")}`;
}

export async function verifyAdminPassword(password: string, passwordHash: string) {
  const [prefix, salt, hash] = passwordHash.split(":");

  if (prefix !== PASSWORD_HASH_PREFIX || !salt || !hash) {
    return false;
  }

  const key = (await scrypt(password, salt, SCRYPT_KEY_LENGTH)) as Buffer;
  return safeEquals(key.toString("hex"), hash);
}

export async function verifyAdminCredentials(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const adminUser = await prisma.adminUser.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (
    adminUser?.isActive &&
    (await verifyAdminPassword(password, adminUser.passwordHash))
  ) {
    return {
      kind: "database" as const,
      userId: adminUser.id,
      passwordHash: adminUser.passwordHash,
    };
  }

  if (await verifyEnvCredentials(normalizedEmail, password)) {
    return {
      kind: "environment" as const,
    };
  }

  return null;
}

export async function isAdminSignedIn() {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ADMIN_AUTH_COOKIE)?.value ?? "";
  const envToken = getEnvAdminToken();

  if (envToken && safeEquals(cookieToken, envToken)) {
    return true;
  }

  const [prefix, userId, signature] = cookieToken.split(":");

  if (prefix !== "db" || !userId || !signature) {
    return false;
  }

  const adminUser = await prisma.adminUser.findUnique({
    where: {
      id: userId,
    },
  });

  if (!adminUser?.isActive) {
    return false;
  }

  return safeEquals(signature, signAdminUserCookie(adminUser.id, adminUser.passwordHash));
}

export async function signInAdmin(
  verifiedCredentials: Awaited<ReturnType<typeof verifyAdminCredentials>>,
) {
  if (!verifiedCredentials) {
    throw new Error("Admin credentials were not verified.");
  }

  const cookieStore = await cookies();

  if (verifiedCredentials.kind === "database") {
    cookieStore.set({
      name: ADMIN_AUTH_COOKIE,
      value: `db:${verifiedCredentials.userId}:${signAdminUserCookie(
        verifiedCredentials.userId,
        verifiedCredentials.passwordHash,
      )}`,
      ...adminCookieOptions(),
    });
    return;
  }

  const token = getEnvAdminToken();

  if (!token) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before using admin login.");
  }

  cookieStore.set({
    name: ADMIN_AUTH_COOKIE,
    value: token,
    ...adminCookieOptions(),
  });
}

export async function signOutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_AUTH_COOKIE);
}
