import { differenceInCalendarDays, isBefore, startOfDay, subDays } from "date-fns";

export function isOverdue(date: Date, completedAt?: Date | null, now = new Date()) {
  return !completedAt && isBefore(date, now);
}

export function isNoResponseCandidate(
  appliedAt: Date | null,
  stage: string,
  thresholdDays: number,
  meaningfulInteractions = 0,
  now = new Date(),
) {
  if (!appliedAt || stage !== "APPLIED" || meaningfulInteractions > 0) return false;
  return appliedAt <= subDays(startOfDay(now), thresholdDays);
}

export function daysSince(date: Date, now = new Date()) {
  return Math.max(0, differenceInCalendarDays(now, date));
}

export function toDateTimeLocal(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
}
