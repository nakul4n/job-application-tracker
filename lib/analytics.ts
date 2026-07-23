import { ApplicationStage, WorkMode } from "@prisma/client";
import { hasResponse, reachedInterview } from "@/lib/stages";

export type AnalyticsApplication = {
  stage: ApplicationStage;
  sourcePlatform: string | null;
  workMode: WorkMode;
  appliedAt: Date | null;
  createdAt: Date;
  timeline?: { occurredAt: Date; type: string }[];
  resumeVersion?: { name: string } | null;
};

function rate(value: number, total: number) {
  return total ? Math.round((value / total) * 100) : 0;
}

export function calculateAnalytics(applications: AnalyticsApplication[]) {
  const submitted = applications.filter((item) => item.stage !== "SAVED");
  const responses = submitted.filter((item) => hasResponse(item.stage));
  const interviews = submitted.filter((item) => reachedInterview(item.stage));
  const offers = submitted.filter((item) => ["OFFER", "ACCEPTED"].includes(item.stage));
  const rejected = submitted.filter((item) => item.stage === "REJECTED");

  const byStage = Object.fromEntries(
    Object.values(ApplicationStage).map((stage) => [
      stage,
      applications.filter((item) => item.stage === stage).length,
    ]),
  ) as Record<ApplicationStage, number>;

  const byWorkMode = Object.fromEntries(
    Object.values(WorkMode).map((mode) => [
      mode,
      applications.filter((item) => item.workMode === mode).length,
    ]),
  ) as Record<WorkMode, number>;

  const bySource = submitted.reduce<Record<string, { applications: number; responses: number }>>(
    (result, item) => {
      const key = item.sourcePlatform || "Other";
      result[key] ??= { applications: 0, responses: 0 };
      result[key].applications += 1;
      if (hasResponse(item.stage)) result[key].responses += 1;
      return result;
    },
    {},
  );

  const responseDays = responses.flatMap((item) => {
    if (!item.appliedAt) return [];
    const firstResponse = item.timeline
      ?.filter((event) => event.type !== "CREATED")
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())[0];
    if (!firstResponse) return [];
    return [
      Math.max(
        0,
        (firstResponse.occurredAt.getTime() - item.appliedAt.getTime()) / 86_400_000,
      ),
    ];
  });

  return {
    total: applications.length,
    submitted: submitted.length,
    responseRate: rate(responses.length, submitted.length),
    interviewRate: rate(interviews.length, submitted.length),
    offerRate: rate(offers.length, submitted.length),
    rejectionRate: rate(rejected.length, submitted.length),
    averageResponseDays: responseDays.length
      ? Math.round(responseDays.reduce((sum, value) => sum + value, 0) / responseDays.length)
      : null,
    byStage,
    bySource,
    byWorkMode,
  };
}
