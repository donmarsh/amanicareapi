import { json, requireCurrentSession } from "@/lib/api";

export async function GET() {
  const auth = await requireCurrentSession();

  if ("response" in auth) {
    return auth.response;
  }

  return json({
    user: {
      id: auth.session.user.id,
      username: auth.session.user.username,
      displayName: auth.session.user.displayName,
      maskedContact: auth.session.user.maskedContact,
    },
    session: {
      expiresAt: auth.session.expiresAt,
    },
  });
}
