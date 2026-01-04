import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

type AdapterDb = Parameters<typeof drizzleAdapter>[0];

const DEV_AUTH_SECRET = "dev-secret-dev-secret-dev-secret-dev-secret";

export function createAuth(env: { DB: D1Database; BETTER_AUTH_SECRET?: string }) {
  const db = drizzle(env.DB, { schema });
  const secret = env.BETTER_AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET ?? DEV_AUTH_SECRET;

  return betterAuth({
    secret,
    database: drizzleAdapter(db as unknown as AdapterDb, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });
}
