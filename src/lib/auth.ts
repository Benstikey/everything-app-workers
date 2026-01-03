import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

type AdapterDb = Parameters<typeof drizzleAdapter>[0];

export function createAuth(env: { DB: D1Database; BETTER_AUTH_SECRET: string }) {
  const db = drizzle(env.DB, { schema });

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db as unknown as AdapterDb, { provider: "sqlite" }),
    emailAndPassword: { enabled: true },
  });
}
