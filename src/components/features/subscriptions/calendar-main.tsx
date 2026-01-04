"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, X, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Subscription, chargeDateForMonth, dayKey } from "@/lib/subscriptions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader as THead,
  TableRow,
} from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { AddSubscriptionForm } from "@/components/features/subscriptions/add-subscription-form";
import { BrandAvatar } from "@/components/features/subscriptions/brand-avatar";

type Charge = { sub: Subscription; date: Date };

type Rect = { top: number; left: number; width: number; height: number };
type DayModalState = {
  day: Date;
  from: Rect;
  to: Rect;
};

type CalendarUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type CalendarMainProps = {
  user?: CalendarUser | null;
};

function currencyEUR(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "EUR",
  }).format(n);
}

function getMonthGrid(month: Date) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 0 }); // Sun
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 0 });

  const days: Date[] = [];
  let cur = start;
  while (cur <= end) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  while (days.length < 42) days.push(addDays(days[days.length - 1], 1));
  return days.slice(0, 42);
}

export default function CalendarMain({ user }: CalendarMainProps) {
  const [subs, setSubs] = useLocalStorage<Subscription[]>(
    "subs-calendar:subs",
    []
  );
  const [month, setMonth] = React.useState<Date>(startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = React.useState<Date>(new Date());
  const [addOpen, setAddOpen] = React.useState(false);

  // Animated day modal state
  const [dayModal, setDayModal] = React.useState<DayModalState | null>(null);

  const gridDays = React.useMemo(() => getMonthGrid(month), [month]);

  const chargesForMonth: Charge[] = React.useMemo(() => {
    return subs
      .map((sub) => {
        const d = chargeDateForMonth(sub, month);
        return d ? { sub, date: d } : null;
      })
      .filter((x): x is Charge => x !== null)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [subs, month]);

  const chargesByDay = React.useMemo(() => {
    const map = new Map<string, Charge[]>();
    for (const c of chargesForMonth) {
      const k = dayKey(c.date);
      const arr = map.get(k) ?? [];
      arr.push(c);
      map.set(k, arr);
    }
    return map;
  }, [chargesForMonth]);

  const monthlyTotal = React.useMemo(
    () => chargesForMonth.reduce((sum, c) => sum + c.sub.amount, 0),
    [chargesForMonth]
  );

  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const displayName = user?.name || "Your Profile";
  const displayEmail = user?.email || "Signed in account";
  const avatarSrc = user?.image || "/avatar.svg";

  function removeSub(id: string) {
    setSubs(subs.filter((s) => s.id !== id));
  }

  function openDayModal(day: Date, rect: DOMRect) {
    setSelectedDay(day);

    const from: Rect = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    };

    // compute centered target box (responsive)
    const pad = 24;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const targetW = Math.min(620, vw - pad * 2);
    const targetH = Math.min(460, vh - pad * 2);

    const to: Rect = {
      top: Math.round((vh - targetH) / 2),
      left: Math.round((vw - targetW) / 2),
      width: Math.round(targetW),
      height: Math.round(targetH),
    };

    setDayModal({ day, from, to });
  }

  // Escape key + scroll lock
  React.useEffect(() => {
    if (!dayModal) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDayModal(null);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dayModal]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Card className="rounded-2xl border bg-card/60 backdrop-blur">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Everything</div>
              <div className="text-lg font-semibold">
                Your Second Brain Dashboard
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              {[
                { label: "Overview", href: "/" },
                { label: "Subscriptions", href: "/" },
                { label: "Calendar", href: "/" },
              ].map((item) => (
                <Button
                  key={item.label}
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  asChild
                >
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center gap-3 rounded-full border bg-muted/40 px-3 py-2 transition hover:bg-muted/60">
                <span className="relative h-10 w-10 overflow-hidden rounded-full border">
                  <Image
                    src={avatarSrc}
                    alt={`${displayName} avatar`}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </span>
                <div className="text-left">
                  <div className="text-sm font-medium">{displayName}</div>
                  <div className="text-xs text-muted-foreground">
                    View profile
                  </div>
                </div>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={10} className="max-w-[220px]">
              <div className="space-y-1">
                <div className="text-sm font-semibold">{displayName}</div>
                <div className="text-xs text-background/80">{displayEmail}</div>
                <div className="text-[11px] text-background/70">
                  Signed in • Hover to see details
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-stretch">
        {/* LEFT SIDEBAR */}
        <Card className="rounded-2xl border bg-card/60 backdrop-blur h-full flex flex-col">
          <CardHeader className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-base">Subscriptions</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Add your monthly spend & see charge days
                </div>
              </div>

              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="rounded-xl">
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl">
                  <DialogHeader>
                    <DialogTitle>Add subscription</DialogTitle>
                  </DialogHeader>
                  <AddSubscriptionForm
                    onAdd={(sub) => {
                      setSubs([sub, ...subs]);
                      setAddOpen(false);
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs text-muted-foreground">Monthly spend</div>
              <div className="mt-1 text-2xl font-semibold tabular-nums">
                {currencyEUR(monthlyTotal)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 flex-1 flex flex-col">
            <Separator />

            {subs.length === 0 ? (
              <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                No subscriptions yet.
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="rounded-xl border overflow-x-auto">
                  <Table>
                    <THead>
                      <TableRow>
                        <TableHead className="w-10"> </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Name
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Amount
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Day
                        </TableHead>
                        <TableHead className="w-10 text-right"> </TableHead>
                      </TableRow>
                    </THead>
                    <TableBody>
                      {subs.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="w-10">
                            <BrandAvatar name={s.name} slug={s.iconSlug} />
                          </TableCell>
                          <TableCell className="font-medium">
                            {s.name}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {currencyEUR(s.amount)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {s.billingDay}
                          </TableCell>
                          <TableCell className="w-10 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl"
                              onClick={() => removeSub(s.id)}
                              aria-label={`Delete ${s.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* RIGHT / MAIN CALENDAR BOX */}
        <Card className="rounded-2xl border bg-card/60 backdrop-blur">
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    setMonth((m) => startOfMonth(addMonths(m, -1)))
                  }
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setMonth((m) => startOfMonth(addMonths(m, 1)))}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <div className="ml-2 leading-none">
                  <div className="text-3xl font-semibold tracking-tight">
                    {format(month, "MMMM")}{" "}
                    <span className="text-muted-foreground">
                      {format(month, "yyyy")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-muted-foreground">
                  Monthly spend
                </div>
                <div className="text-lg font-semibold tabular-nums">
                  {currencyEUR(monthlyTotal)}
                </div>
              </div>
            </div>

            {/* weekday pills */}
            <div className="grid grid-cols-7 gap-3">
              {weekdays.map((d) => (
                <Button
                  key={d}
                  variant="secondary"
                  className="h-9 rounded-full text-xs tracking-wide opacity-90"
                  disabled
                >
                  {d}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-7 gap-3">
              {gridDays.map((day) => {
                const inMonth = isSameMonth(day, month);
                const isSelected = isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());

                const dayCharges = chargesByDay.get(dayKey(day)) ?? [];
                const count = dayCharges.length;

                // screenshot vibe: 1–2 logos centered, overlapped, +N badge
                const show = dayCharges.slice(0, 2);
                const overflow = Math.max(0, count - show.length);

                return (
                  <Button
                    key={day.toISOString()}
                    variant="secondary"
                    className={cn(
                      "relative h-32 w-full rounded-2xl p-3",
                      "justify-start items-start",
                      "bg-muted/50 hover:bg-muted/70",
                      "border border-transparent hover:border-foreground/10",
                      "transition-colors",
                      !inMonth && "opacity-40",
                      isToday && "ring-1 ring-foreground/15",
                      isSelected && "ring-2 ring-foreground/25"
                    )}
                    aria-haspopup="dialog"
                    onClick={(e) =>
                      openDayModal(
                        day,
                        (e.currentTarget as HTMLElement).getBoundingClientRect()
                      )
                    }
                  >
                    <div className="text-sm tabular-nums text-foreground/90">
                      {format(day, "dd")}
                    </div>

                    {count > 0 && (
                      <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-foreground/35" />
                    )}

                    {count > 0 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center">
                          {show.map((c, idx) => (
                            <div
                              key={`${c.sub.id}:${day.toISOString()}`}
                              className={cn(
                                "transition-transform",
                                idx > 0 && "-ml-3"
                              )}
                            >
                              <BrandAvatar
                                name={c.sub.name}
                                slug={c.sub.iconSlug}
                              />
                            </div>
                          ))}

                          {overflow > 0 && (
                            <Badge
                              variant="secondary"
                              className="ml-2 rounded-full px-2 tabular-nums"
                            >
                              +{overflow}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animated modal (tile → modal) */}
      <AnimatePresence>
        {dayModal &&
          (() => {
            const FADE_OUT = 0.12; // how long the inner content fades out before shrink starts

            const cardVariants = {
              from: {
                top: dayModal.from.top,
                left: dayModal.from.left,
                width: dayModal.from.width,
                height: dayModal.from.height,
                borderRadius: 16,
                opacity: 1,
              },
              open: {
                top: dayModal.to.top,
                left: dayModal.to.left,
                width: dayModal.to.width,
                height: dayModal.to.height,
                borderRadius: 24,
                opacity: 1,
                transition: { type: "spring", stiffness: 360, damping: 34 },
              },
              closed: {
                top: dayModal.from.top,
                left: dayModal.from.left,
                width: dayModal.from.width,
                height: dayModal.from.height,
                borderRadius: 16,
                opacity: 0, // 👈 dissolve while shrinking
                transition: {
                  type: "spring",
                  stiffness: 360,
                  damping: 34,
                  delay: FADE_OUT, // 👈 wait for content to fade out first
                  opacity: {
                    duration: 0.18, // 👈 smooth dissolve timing
                    delay: FADE_OUT, // 👈 starts dissolving when shrink starts
                    ease: "easeOut",
                  },
                },
              },
            } as const;

            const contentVariants = {
              open: {
                opacity: 1,
                transition: { duration: 0.12, delay: 0.06 },
              },
              closed: {
                opacity: 0,
                transition: { duration: FADE_OUT },
              },
            } as const;

            const list = chargesByDay.get(dayKey(dayModal.day)) ?? [];
            const total = list.reduce((s, c) => s + c.sub.amount, 0);

            const headerShow = list.slice(0, 2);
            const headerOverflow = Math.max(0, list.length - headerShow.length);

            return (
              <>
                {/* overlay */}
                <motion.div
                  className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => setDayModal(null)}
                />

                {/* expanding / shrinking card */}
                <motion.div
                  className="fixed z-50 overflow-hidden rounded-2xl border bg-card/70 shadow-2xl backdrop-blur"
                  variants={cardVariants}
                  initial="from"
                  animate="open"
                  exit="closed"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* content fades out BEFORE shrink; card dissolves while shrinking */}
                  <motion.div
                    className="h-full w-full"
                    variants={contentVariants}
                    initial="closed"
                    animate="open"
                    exit="closed"
                  >
                    <div className="flex h-full flex-col">
                      <div className="flex items-start justify-between gap-4 border-b p-5">
                        <div className="space-y-2">
                          <div>
                            <div className="text-base font-semibold">
                              {format(dayModal.day, "EEEE, MMM d")}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {list.length === 0
                                ? "No charges on this day"
                                : `${list.length} charge(s)`}
                            </div>
                          </div>

                          {list.length > 0 && (
                            <div className="flex items-center">
                              {headerShow.map((c, idx) => (
                                <div
                                  key={c.sub.id}
                                  className={cn(idx > 0 && "-ml-3")}
                                >
                                  <BrandAvatar
                                    name={c.sub.name}
                                    slug={c.sub.iconSlug}
                                  />
                                </div>
                              ))}
                              {headerOverflow > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 rounded-full px-2 tabular-nums"
                                >
                                  +{headerOverflow}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="secondary"
                          size="icon"
                          className="rounded-full"
                          onClick={() => setDayModal(null)}
                          aria-label="Close"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 p-5">
                        {list.length === 0 ? (
                          <div className="flex h-full items-center justify-center">
                            <div className="rounded-2xl border bg-muted/30 px-6 py-4 text-sm text-muted-foreground">
                              Nothing scheduled.
                            </div>
                          </div>
                        ) : (
                          <div className="flex h-full flex-col gap-4">
                            <div className="flex items-baseline justify-between rounded-2xl border bg-muted/20 p-4">
                              <div className="text-xs text-muted-foreground">
                                Total
                              </div>
                              <div className="text-lg font-semibold tabular-nums">
                                {currencyEUR(total)}
                              </div>
                            </div>

                            <div className="flex-1 overflow-hidden rounded-2xl border">
                              <ScrollArea className="h-full">
                                <div className="p-3">
                                  <div className="space-y-2">
                                    {list.map((c) => (
                                      <div
                                        key={`${
                                          c.sub.id
                                        }:${c.date.toISOString()}`}
                                        className="flex items-center justify-between rounded-2xl border bg-card/40 px-3 py-2"
                                      >
                                        <div className="flex items-center gap-3">
                                          <BrandAvatar
                                            name={c.sub.name}
                                            slug={c.sub.iconSlug}
                                          />
                                          <div className="leading-tight">
                                            <div className="text-sm font-medium">
                                              {c.sub.name}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                              Billing day {c.sub.billingDay}
                                            </div>
                                          </div>
                                        </div>

                                        <Badge
                                          variant="secondary"
                                          className="rounded-full tabular-nums"
                                        >
                                          {currencyEUR(c.sub.amount)}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </ScrollArea>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}
