import { ApplicationStage } from "@prisma/client";

export const stageOptions = [
  ApplicationStage.SAVED,
  ApplicationStage.APPLIED,
  ApplicationStage.RECRUITER_SCREENING,
  ApplicationStage.ASSESSMENT,
  ApplicationStage.TECHNICAL_INTERVIEW,
  ApplicationStage.MANAGERIAL_INTERVIEW,
  ApplicationStage.FINAL_INTERVIEW,
  ApplicationStage.OFFER,
  ApplicationStage.ACCEPTED,
  ApplicationStage.REJECTED,
  ApplicationStage.WITHDRAWN,
  ApplicationStage.NO_RESPONSE,
] as const;

export const stageLabels: Record<ApplicationStage, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  RECRUITER_SCREENING: "Recruiter screening",
  ASSESSMENT: "Assessment",
  TECHNICAL_INTERVIEW: "Technical interview",
  MANAGERIAL_INTERVIEW: "Managerial interview",
  FINAL_INTERVIEW: "Final interview",
  OFFER: "Offer",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
  NO_RESPONSE: "No response",
};

export const interviewStages = new Set<ApplicationStage>([
  ApplicationStage.TECHNICAL_INTERVIEW,
  ApplicationStage.MANAGERIAL_INTERVIEW,
  ApplicationStage.FINAL_INTERVIEW,
]);

export const activeStages = new Set<ApplicationStage>([
  ApplicationStage.APPLIED,
  ApplicationStage.RECRUITER_SCREENING,
  ApplicationStage.ASSESSMENT,
  ...interviewStages,
]);

export function hasResponse(stage: ApplicationStage) {
  return (
    stage !== ApplicationStage.SAVED &&
    stage !== ApplicationStage.APPLIED &&
    stage !== ApplicationStage.NO_RESPONSE
  );
}

export function reachedInterview(stage: ApplicationStage) {
  return (
    interviewStages.has(stage) ||
    stage === ApplicationStage.OFFER ||
    stage === ApplicationStage.ACCEPTED
  );
}

export function timelineTypeForStage(stage: ApplicationStage) {
  if (stage === ApplicationStage.REJECTED) return "REJECTION_RECEIVED" as const;
  if (stage === ApplicationStage.OFFER || stage === ApplicationStage.ACCEPTED) {
    return "OFFER_RECEIVED" as const;
  }
  return "STAGE_CHANGED" as const;
}
