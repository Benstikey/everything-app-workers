"use client";

import * as React from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BRAND_ICONS, type BrandSlug } from "@/lib/brand-icons";
import type { Subscription } from "@/lib/subscriptions";

export function AddSubscriptionForm({
  onAdd,
}: {
  onAdd: (sub: Subscription) => void;
}) {
  const [name, setName] = React.useState("");
  const [amount, setAmount] = React.useState<string>("9.99");
  const [billingDay, setBillingDay] = React.useState<string>("1");
  const [startDate, setStartDate] = React.useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [iconSlug, setIconSlug] = React.useState<string>("");

  const amountNum = Number(amount);
  const billingDayNum = Number(billingDay);

  const valid =
    name.trim().length > 0 &&
    Number.isFinite(amountNum) &&
    amountNum > 0 &&
    Number.isFinite(billingDayNum) &&
    billingDayNum >= 1 &&
    billingDayNum <= 31 &&
    startDate.trim().length > 0;

  const quickPicks: Array<{ label: string; slug: BrandSlug }> = [
    { label: "Netflix", slug: "netflix" },
    { label: "Spotify", slug: "spotify" },
    { label: "YouTube", slug: "youtube" },
  ];

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Quick pick (simple-icons)</Label>
        <div className="grid grid-cols-2 gap-2">
          {quickPicks.map((p) => {
            const icon = BRAND_ICONS[p.slug];
            return (
              <Button
                key={p.slug}
                type="button"
                variant="secondary"
                className="justify-start rounded-xl"
                onClick={() => {
                  setName(p.label);
                  setIconSlug(p.slug);
                }}
              >
                <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-xl border bg-foreground/5 text-foreground/90">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="currentColor"
                    aria-label={icon.title}
                  >
                    <path d={icon.path} />
                  </svg>
                </span>
                <span className="text-sm">{p.label}</span>
              </Button>
            );
          })}
        </div>
        <div className="text-xs text-muted-foreground">
          Store an <span className="font-medium">iconSlug</span> like{" "}
          <code>netflix</code> / <code>spotify</code>. Add more mappings in{" "}
          <code>lib/brand-icons.ts</code>.
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Netflix"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="amount">Monthly amount</Label>
          <Input
            id="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="day">Billing day (1–31)</Label>
          <Input
            id="day"
            type="number"
            min="1"
            max="31"
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="start">Starts on</Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="slug">Icon slug (optional)</Label>
          <Input
            id="slug"
            placeholder="netflix"
            value={iconSlug}
            onChange={(e) => setIconSlug(e.target.value)}
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          className="rounded-xl"
          disabled={!valid}
          onClick={() => {
            const sub: Subscription = {
              id: crypto.randomUUID(),
              name: name.trim(),
              amount: Math.round(amountNum * 100) / 100,
              billingDay: billingDayNum,
              startDate: new Date(startDate).toISOString(),
              iconSlug: iconSlug.trim() || undefined,
            };
            onAdd(sub);
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
