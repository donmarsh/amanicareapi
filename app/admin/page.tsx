import { connection } from "next/server";

import {
  AdminLocked,
  type AdminSearchParams,
  DevelopmentAccessNotice,
  hasAdminAccess,
  readAdminAccessParams,
} from "@/app/admin/access";
import {
  Button,
  chatStatuses,
  formatDate,
  helpStatuses,
  HiddenAdminKey,
  HiddenReturnTo,
  PageHeader,
  Select,
  severities,
  shortId,
  statusTone,
  TextArea,
} from "@/app/admin/ui";
import {
  sendSupportMessage,
  updateChatSessionStatus,
  updateHelpRequestSeverity,
  updateHelpRequestStatus,
} from "@/app/admin/actions";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: AdminSearchParams;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await connection();

  const { key, error } = await readAdminAccessParams(searchParams);

  if (!(await hasAdminAccess(key))) {
    return <AdminLocked error={error} />;
  }

  const [
    userCount,
    submittedCount,
    openChatCount,
    urgentResourceCount,
    helpRequests,
    chatSessions,
  ] = await Promise.all([
    prisma.anonymousUser.count(),
    prisma.helpRequest.count({
      where: {
        status: {
          in: ["SUBMITTED", "TRIAGED"],
        },
      },
    }),
    prisma.chatSession.count({
      where: {
        status: "OPEN",
      },
    }),
    prisma.resource.count({
      where: {
        isUrgent: true,
      },
    }),
    prisma.helpRequest.findMany({
      include: {
        user: true,
      },
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
    }),
    prisma.chatSession.findMany({
      include: {
        user: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 3,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="Care operations dashboard"
        description="Review support requests, watch active communications, and track the services people may need most urgently."
        action={<DevelopmentAccessNotice />}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Anonymous users", userCount],
          ["Active help queue", submittedCount],
          ["Open chats", openChatCount],
          ["Urgent resources", urgentResourceCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Help requests</h2>
            <p className="text-sm text-zinc-500">{helpRequests.length} recent records</p>
          </div>
          <div className="mt-4 grid gap-3">
            {helpRequests.map((request) => (
              <article key={request.id} className="grid gap-4 rounded-lg border border-zinc-200 p-4">
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(request.status)}`}>
                      {request.status}
                    </span>
                    {request.severity ? (
                      <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(request.severity)}`}>
                        {request.severity}
                      </span>
                    ) : null}
                    <span className="text-xs font-medium text-zinc-500">
                      {request.needType} · {formatDate(request.submittedAt ?? request.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-zinc-700">
                    {request.description || "No description provided."}
                  </p>
                  <dl className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-2">
                    <div>
                      <dt className="font-medium text-zinc-900">Person</dt>
                      <dd>{request.user.displayName || request.user.username}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Location</dt>
                      <dd>{request.locationText || "Not provided"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Contact</dt>
                      <dd>{request.preferredContact} · safe: {request.safeToContact ? "yes" : "no"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-zinc-900">Notes</dt>
                      <dd>{request.contactNotes || "None"}</dd>
                    </div>
                  </dl>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <form action={updateHelpRequestStatus} className="grid gap-2">
                    <HiddenAdminKey value={key} />
                    <HiddenReturnTo value="/admin" />
                    <input type="hidden" name="id" value={request.id} />
                    <Select
                      label="Status"
                      name="status"
                      defaultValue={request.status}
                      options={helpStatuses.map((status) => ({ label: status, value: status }))}
                    />
                    <Button>Update status</Button>
                  </form>
                  <form action={updateHelpRequestSeverity} className="grid gap-2">
                    <HiddenAdminKey value={key} />
                    <HiddenReturnTo value="/admin" />
                    <input type="hidden" name="id" value={request.id} />
                    <Select
                      label="Severity"
                      name="severity"
                      defaultValue={request.severity}
                      options={severities.map((severity) => ({
                        label: severity || "Not set",
                        value: severity,
                      }))}
                    />
                    <Button>Update severity</Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Communications</h2>
            <p className="text-sm text-zinc-500">Anonymous chat sessions</p>
          </div>
          <div className="mt-4 grid gap-3">
            {chatSessions.map((session) => (
              <article key={session.id} className="grid gap-4 rounded-lg border border-zinc-200 p-4">
                <div className="grid gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(session.status)}`}>
                      {session.status}
                    </span>
                    <span className="text-xs font-medium text-zinc-500">
                      {session.subject || `Session ${shortId(session.id)}`} · {formatDate(session.updatedAt)}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {session.messages.length ? (
                      session.messages
                        .slice()
                        .reverse()
                        .map((message) => (
                          <p
                            key={message.id}
                            className="rounded-md bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-700"
                          >
                            <span className="font-semibold text-zinc-950">{message.senderRole}: </span>
                            {message.body}
                          </p>
                        ))
                    ) : (
                      <p className="text-sm text-zinc-500">No messages yet.</p>
                    )}
                  </div>
                </div>
                <div className="grid gap-3">
                  <form action={sendSupportMessage} className="grid gap-2">
                    <HiddenAdminKey value={key} />
                    <HiddenReturnTo value="/admin" />
                    <input type="hidden" name="chatSessionId" value={session.id} />
                    <TextArea label="Support reply" name="body" required rows={3} />
                    <Button>Send reply</Button>
                  </form>
                  <form action={updateChatSessionStatus} className="grid gap-2">
                    <HiddenAdminKey value={key} />
                    <HiddenReturnTo value="/admin" />
                    <input type="hidden" name="id" value={session.id} />
                    <Select
                      label="Session status"
                      name="status"
                      defaultValue={session.status}
                      options={chatStatuses.map((status) => ({ label: status, value: status }))}
                    />
                    <Button>Update chat</Button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </>
  );
}
