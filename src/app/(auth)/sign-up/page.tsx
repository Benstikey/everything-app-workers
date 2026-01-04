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

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please enter your name, email, and password.");
      return;
    }

    await authClient.signUp.email(
      {
        name,
        email,
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
          setError(formatAuthError(ctx.error, "Could not create account."));
        },
      }
    );
  }

  return (
    <Card className="w-full rounded-2xl border bg-card/60 backdrop-blur">
      <CardHeader className="space-y-1">
        <CardTitle className="text-base">Create account</CardTitle>
        <div className="text-sm text-muted-foreground">
          Start small now, expand later.
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              className="rounded-xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

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
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div
              className="rounded-xl border bg-muted/40 p-3 text-sm text-foreground/90"
              role="alert"
            >
              {error}
            </div>
          )}

          <Button className="w-full rounded-xl" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <div className="space-y-3">
          <Separator />
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
