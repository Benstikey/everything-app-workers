import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

type AdapterDb = Parameters<typeof drizzleAdapter>[0];

// CLI-only placeholder (the generator won't run queries)
const db = {} as unknown as AdapterDb;

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET ?? "dev-secret-dev-secret-dev-secret-dev-secret",
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
});
