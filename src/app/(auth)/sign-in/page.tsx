"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { formatAuthError } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    await authClient.signIn.email(
      {
        email: email.trim(),
        password,
        callbackURL: "/",
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setLoading(false);
          router.push("/");
          router.refresh();
        },
        onError: (ctx) => {
          setLoading(false);
          setError(formatAuthError(ctx.error?.message) ?? "Could not sign in.");
        },
      }
    );
  }

  return (
    <Card className="w-full rounded-2xl border bg-card/60 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Sign in</CardTitle>
        <div className="text-sm text-muted-foreground">
          Welcome back. Continue where you left off.
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              className="rounded-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              className="rounded-xl"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-xl border bg-muted/40 p-3 text-sm text-foreground/90">
              {error}
            </div>
          )}

          <Button className="w-full rounded-xl" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="space-y-3">
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link href="/sign-up" className="text-foreground underline underline-offset-4">
              Create one
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
