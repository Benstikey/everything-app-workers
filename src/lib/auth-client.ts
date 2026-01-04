import { createAuthClient } from "better-auth/react";

function getAuthBaseURL() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/auth`;
  }

  const publicBaseURL =
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  return `${publicBaseURL}/api/auth`;
}

export const authClient = createAuthClient({
  baseURL: getAuthBaseURL(),
});
