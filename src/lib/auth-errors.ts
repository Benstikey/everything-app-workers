const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "Invalid email": "Enter a valid email address.",
  "Invalid password": "Enter a valid password.",
  "Invalid email or password": "Email or password is incorrect.",
  "User already exists. Use another email.": "An account already exists for this email.",
  "User already exists.": "An account already exists for this email.",
  "User email not found": "We couldn’t find an account with that email.",
  "Email not verified": "Verify your email before signing in.",
  "Password too short": "Password is too short.",
  "Password too long": "Password is too long.",
  "Field is required": "Please fill in all required fields.",
  "Invalid origin": "Request blocked. Please refresh and try again.",
  "Cross-site navigation login blocked. This request appears to be a CSRF attack.":
    "Request blocked for security reasons. Please refresh and try again.",
};

export function formatAuthError(message?: string | null) {
  if (!message) return "Something went wrong. Please try again.";
  return AUTH_ERROR_MESSAGES[message] ?? message;
}
