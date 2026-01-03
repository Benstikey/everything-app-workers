import { toNextJsHandler } from "better-auth/next-js";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createAuth } from "@/lib/auth";

type EnvWithAuth = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
};

export async function GET(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth(env as unknown as EnvWithAuth);
  return toNextJsHandler(auth).GET(req);
}

export async function POST(req: Request) {
  const { env } = await getCloudflareContext({ async: true });
  const auth = createAuth(env as unknown as EnvWithAuth);
  return toNextJsHandler(auth).POST(req);
}
