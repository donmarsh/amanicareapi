import type {
  ContactPreference,
  HelpNeedType,
  IncidentSeverity,
} from "@/generated/prisma/enums";

import { badRequest, json, readString, requireCurrentSession } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const NEED_TYPES = new Set(["MEDICAL", "SECURITY", "COUNSELING", "REPORT_INCIDENT"]);
const CONTACT_PREFERENCES = new Set(["IN_APP", "EMAIL", "PHONE", "NONE"]);
const SEVERITIES = new Set(["LOW", "MEDIUM", "HIGH", "IMMEDIATE_DANGER"]);

export async function GET() {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const requests = await prisma.helpRequest.findMany({
    where: {
      userId: auth.session.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ requests });
}

export async function POST(request: Request) {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const needType = readString(body?.needType).toUpperCase();
  const preferredContact = readString(body?.preferredContact).toUpperCase() || "IN_APP";
  const severity = readString(body?.severity).toUpperCase();
  const submit = Boolean(body?.submit);

  if (!NEED_TYPES.has(needType)) {
    return badRequest("Choose a valid help need type.");
  }

  if (!CONTACT_PREFERENCES.has(preferredContact)) {
    return badRequest("Choose a valid contact preference.");
  }

  if (severity && !SEVERITIES.has(severity)) {
    return badRequest("Choose a valid incident severity.");
  }

  const helpRequest = await prisma.helpRequest.create({
    data: {
      userId: auth.session.userId,
      needType: needType as HelpNeedType,
      status: submit ? "SUBMITTED" : "DRAFT",
      description: readString(body?.description) || null,
      locationText: readString(body?.locationText) || null,
      preferredContact: preferredContact as ContactPreference,
      safeToContact: Boolean(body?.safeToContact),
      contactNotes: readString(body?.contactNotes) || null,
      severity: severity ? (severity as IncidentSeverity) : null,
      incidentOccurredAt: body?.incidentOccurredAt ? new Date(body.incidentOccurredAt) : null,
      submittedAt: submit ? new Date() : null,
    },
  });

  return json({ request: helpRequest }, { status: 201 });
}
