import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import CalendarMain from "@/components/features/subscriptions/calendar-main";
import { createAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

type EnvWithAuth = {
  DB: D1Database;
  BETTER_AUTH_SECRET?: string;
};

export default async function Page() {
  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth(env as unknown as EnvWithAuth);

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/sign-in");

  return <CalendarMain user={session.user} />;
}
