export type AuthErrorLike = {
  message?: string;
  code?: string;
};

export function formatAuthError(
  error?: AuthErrorLike,
  fallback = "Something went wrong."
) {
  const message = error?.message?.trim() ?? "";
  const normalized = message.toLowerCase();
  const code = error?.code?.toLowerCase();

  if (code === "user_already_exists" || normalized.includes("already exists")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (code === "invalid_credentials" || normalized.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (normalized.includes("invalid") && normalized.includes("email")) {
    return "Enter a valid email address.";
  }
  if (normalized.includes("invalid") && normalized.includes("password")) {
    return "Incorrect password. Please try again.";
  }
  if (normalized.includes("user not found") || normalized.includes("no user")) {
    return "We couldn't find an account with that email.";
  }
  if (normalized.includes("required")) {
    return "Please fill in all required fields.";
  }

  return message || fallback;
}
