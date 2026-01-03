import {
  endOfMonth,
  format,
  getDaysInMonth,
  isBefore,
  parseISO,
  setDate,
  startOfMonth,
} from "date-fns";

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingDay: number; // 1..31
  startDate: string;  // ISO
  iconSlug?: string;  // e.g. "netflix", "spotify", "disneyplus"
};

export function monthKey(d: Date) {
  return format(d, "yyyy-MM");
}

export function dayKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

/**
 * Charge date for a given subscription in a given month.
 * - If billingDay exceeds month length: uses last day of month.
 * - If startDate is after that charge date: no charge that month.
 */
export function chargeDateForMonth(sub: Subscription, month: Date): Date | null {
  const monthStart = startOfMonth(month);
  const start = parseISO(sub.startDate);

  if (isBefore(endOfMonth(monthStart), start)) return null;

  const dim = getDaysInMonth(monthStart);
  const day = Math.min(Math.max(sub.billingDay, 1), dim);
  const candidate = setDate(monthStart, day);

  if (isBefore(candidate, start)) return null;

  return candidate;
}
