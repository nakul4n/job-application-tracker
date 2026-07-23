import { describe, expect, it } from "vitest";
import { daysSince, isNoResponseCandidate, isOverdue } from "@/lib/dates";

describe("date helpers", () => {
  const now = new Date("2026-07-24T12:00:00Z");

  it("identifies stale applied applications", () => {
    expect(
      isNoResponseCandidate(new Date("2026-07-01T12:00:00Z"), "APPLIED", 14, 0, now),
    ).toBe(true);
    expect(
      isNoResponseCandidate(new Date("2026-07-01T12:00:00Z"), "APPLIED", 14, 1, now),
    ).toBe(false);
    expect(
      isNoResponseCandidate(new Date("2026-07-01T12:00:00Z"), "REJECTED", 14, 0, now),
    ).toBe(false);
  });

  it("does not call completed reminders overdue", () => {
    expect(isOverdue(new Date("2026-07-20T12:00:00Z"), null, now)).toBe(true);
    expect(
      isOverdue(
        new Date("2026-07-20T12:00:00Z"),
        new Date("2026-07-21T12:00:00Z"),
        now,
      ),
    ).toBe(false);
  });

  it("returns non-negative elapsed calendar days", () => {
    expect(daysSince(new Date("2026-07-20T12:00:00Z"), now)).toBe(4);
    expect(daysSince(new Date("2026-07-25T12:00:00Z"), now)).toBe(0);
  });
});
