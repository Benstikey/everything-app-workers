import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

type AdapterDb = Parameters<typeof drizzleAdapter>[0];

type AuthEnv = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL?: string;
  NEXT_PUBLIC_APP_URL?: string;
};

function resolveAuthBaseURL(env: AuthEnv) {
  return env.BETTER_AUTH_URL ?? env.NEXT_PUBLIC_APP_URL;
}

function resolveTrustedOrigins(baseURL?: string) {
  if (!baseURL) return undefined;
  try {
    return [new URL(baseURL).origin];
  } catch {
    return undefined;
  }
}

export function createAuth(env: AuthEnv) {
  const db = drizzle(env.DB, { schema });
  const baseURL = resolveAuthBaseURL(env);

  return betterAuth({
    baseURL,
    trustedOrigins: resolveTrustedOrigins(baseURL),
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db as unknown as AdapterDb, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });
}
