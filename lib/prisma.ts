import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { parseMariaDbUrl } from "@/lib/database-url";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const adapter = new PrismaMariaDb(parseMariaDbUrl(databaseUrl));

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
