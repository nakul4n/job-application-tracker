import { ApplicationStage } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  hasResponse,
  reachedInterview,
  timelineTypeForStage,
} from "@/lib/stages";

describe("stage helpers", () => {
  it("uses explicit response semantics", () => {
    expect(hasResponse(ApplicationStage.APPLIED)).toBe(false);
    expect(hasResponse(ApplicationStage.RECRUITER_SCREENING)).toBe(true);
    expect(hasResponse(ApplicationStage.REJECTED)).toBe(true);
  });

  it("counts later outcomes as having reached interview", () => {
    expect(reachedInterview(ApplicationStage.TECHNICAL_INTERVIEW)).toBe(true);
    expect(reachedInterview(ApplicationStage.OFFER)).toBe(true);
    expect(reachedInterview(ApplicationStage.ASSESSMENT)).toBe(false);
  });

  it("creates meaningful outcome timeline types", () => {
    expect(timelineTypeForStage(ApplicationStage.REJECTED)).toBe("REJECTION_RECEIVED");
    expect(timelineTypeForStage(ApplicationStage.OFFER)).toBe("OFFER_RECEIVED");
    expect(timelineTypeForStage(ApplicationStage.APPLIED)).toBe("STAGE_CHANGED");
  });
});
