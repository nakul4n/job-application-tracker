import { ApplicationStage, WorkMode } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { calculateAnalytics } from "@/lib/analytics";

describe("calculateAnalytics", () => {
  it("uses submitted applications as the conversion denominator", () => {
    const createdAt = new Date("2026-01-01T00:00:00Z");
    const result = calculateAnalytics([
      { stage: ApplicationStage.SAVED, sourcePlatform: null, workMode: WorkMode.REMOTE, appliedAt: null, createdAt },
      { stage: ApplicationStage.APPLIED, sourcePlatform: "LinkedIn", workMode: WorkMode.REMOTE, appliedAt: createdAt, createdAt },
      { stage: ApplicationStage.TECHNICAL_INTERVIEW, sourcePlatform: "Referral", workMode: WorkMode.HYBRID, appliedAt: createdAt, createdAt },
      { stage: ApplicationStage.OFFER, sourcePlatform: "Referral", workMode: WorkMode.HYBRID, appliedAt: createdAt, createdAt },
    ]);
    expect(result.submitted).toBe(3);
    expect(result.responseRate).toBe(67);
    expect(result.interviewRate).toBe(67);
    expect(result.offerRate).toBe(33);
    expect(result.bySource.Referral).toEqual({ applications: 2, responses: 2 });
  });

  it("returns zero rates for an empty dataset", () => {
    expect(calculateAnalytics([])).toMatchObject({
      total: 0,
      responseRate: 0,
      interviewRate: 0,
      offerRate: 0,
      averageResponseDays: null,
    });
  });
});
