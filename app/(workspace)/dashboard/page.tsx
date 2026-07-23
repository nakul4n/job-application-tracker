import { endOfWeek, startOfWeek } from "date-fns";
import Link from "next/link";
import { completeFollowUpAction } from "@/actions/workspace-actions";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { activeStages, reachedInterview, stageLabels } from "@/lib/stages";

export const metadata = { title: "Overview" };

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const [applications, followUps, interviews, recentActivity, settings] =
    await Promise.all([
      prisma.application.findMany({
        where: { userId: user.id, archivedAt: null },
        select: { id: true, stage: true, appliedAt: true, companyName: true, roleTitle: true },
      }),
      prisma.followUp.findMany({
        where: { userId: user.id, completedAt: null },
        include: { application: { select: { companyName: true, roleTitle: true } } },
        orderBy: { dueAt: "asc" },
        take: 6,
      }),
      prisma.interview.findMany({
        where: {
          application: { userId: user.id },
          completedAt: null,
          scheduledAt: { gte: now },
        },
        include: { application: { select: { id: true, companyName: true, roleTitle: true } } },
        orderBy: { scheduledAt: "asc" },
        take: 4,
      }),
      prisma.applicationTimelineEvent.findMany({
        where: { application: { userId: user.id } },
        include: { application: { select: { id: true, companyName: true } } },
        orderBy: { occurredAt: "desc" },
        take: 6,
      }),
      prisma.userSettings.findUnique({ where: { userId: user.id } }),
    ]);

  const thisWeek = applications.filter(
    (item) => item.appliedAt && item.appliedAt >= weekStart && item.appliedAt <= weekEnd,
  ).length;
  const active = applications.filter((item) => activeStages.has(item.stage)).length;
  const offerCount = applications.filter((item) =>
    ["OFFER", "ACCEPTED"].includes(item.stage),
  ).length;
  const interviewed = applications.filter((item) => reachedInterview(item.stage)).length;
  const submitted = applications.filter((item) => item.stage !== "SAVED").length;
  const weeklyGoal = settings?.weeklyApplicationGoal ?? 5;

  if (!applications.length) {
    return (
      <>
        <div className="pageHeader">
          <div>
            <h1>Good morning, {user.name?.split(" ")[0] || "there"}</h1>
            <p>Your job-search workspace is ready for its first opportunity.</p>
          </div>
        </div>
        <div className="emptyState">
          <div>
            <span className="eyebrow">Start with one role</span>
            <h2>Save your first application</h2>
            <p>
              Add a job you are considering or have already applied to. You can attach
              contacts, interviews, reminders, and notes afterward.
            </p>
            <Link className="button" href="/applications/new">
              Add an application
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Good morning, {user.name?.split(" ")[0] || "there"}</h1>
          <p>Here is what needs your attention today.</p>
        </div>
        <Link className="button secondary" href="/applications?attention=true">
          View needs attention
        </Link>
      </div>

      <section className="summaryGrid" aria-label="Application summary">
        <article className="metricCard">
          <span className="metricLabel">Active pipeline</span>
          <strong className="metricValue">{active}</strong>
          <span className="metricMeta">{applications.length} total applications</span>
        </article>
        <article className="metricCard">
          <span className="metricLabel">Applied this week</span>
          <strong className="metricValue">{thisWeek}</strong>
          <div className="progressTrack" aria-label={`${thisWeek} of ${weeklyGoal} weekly goal`}>
            <div
              className="progressFill"
              style={{ width: `${Math.min(100, (thisWeek / weeklyGoal) * 100)}%` }}
            />
          </div>
          <span className="metricMeta">Goal: {weeklyGoal}</span>
        </article>
        <article className="metricCard">
          <span className="metricLabel">Interviews reached</span>
          <strong className="metricValue">{interviewed}</strong>
          <span className="metricMeta">
            {submitted ? Math.round((interviewed / submitted) * 100) : 0}% of submitted
          </span>
        </article>
        <article className="metricCard">
          <span className="metricLabel">Offers</span>
          <strong className="metricValue">{offerCount}</strong>
          <span className="metricMeta">
            {applications.filter((item) => item.stage === "REJECTED").length} closed as rejected
          </span>
        </article>
      </section>

      <div className="dashboardGrid">
        <section className="panel">
          <div className="panelHeader">
            <h2>Follow-ups</h2>
            <Link href="/follow-ups">View all</Link>
          </div>
          {followUps.length ? (
            <ul className="actionList">
              {followUps.map((followUp) => {
                const overdue = followUp.dueAt < now;
                return (
                  <li className="actionItem" key={followUp.id}>
                    <div>
                      <strong>{followUp.title}</strong>
                      <span className="subtle">
                        {followUp.application
                          ? `${followUp.application.roleTitle} at ${followUp.application.companyName}`
                          : "General follow-up"}
                        {" · "}
                        {new Intl.DateTimeFormat("en", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(followUp.dueAt)}
                      </span>
                    </div>
                    <div className="cluster">
                      {overdue && <span className="badge overdue">Overdue</span>}
                      <form action={completeFollowUpAction}>
                        <input name="id" type="hidden" value={followUp.id} />
                        <button className="button secondary small" type="submit">
                          Complete
                        </button>
                      </form>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="subtle">No follow-ups are due. Add one from any application.</p>
          )}
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Upcoming interviews</h2>
            <Link href="/interviews">View all</Link>
          </div>
          {interviews.length ? (
            <ul className="simpleList">
              {interviews.map((interview) => (
                <li className="simpleItem" key={interview.id}>
                  <div>
                    <strong>{interview.roundName}</strong>
                    <span className="subtle">
                      {interview.application.companyName}
                      <br />
                      {new Intl.DateTimeFormat("en", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(interview.scheduledAt)}
                    </span>
                  </div>
                  <Link
                    className="badge interview"
                    href={`/applications/${interview.application.id}`}
                  >
                    Prepare
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="subtle">No upcoming interviews yet.</p>
          )}
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Recent activity</h2>
            <Link href="/applications">Open pipeline</Link>
          </div>
          <ul className="timeline">
            {recentActivity.map((event) => (
              <li className="timelineItem" key={event.id}>
                <strong>{event.title}</strong>
                <p>
                  <Link href={`/applications/${event.application.id}`}>
                    {event.application.companyName}
                  </Link>
                  {" · "}
                  {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
                    event.occurredAt,
                  )}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>Pipeline snapshot</h2>
            <Link href="/analytics">Full analytics</Link>
          </div>
          <div className="barList">
            {Object.entries(
              applications.reduce<Record<string, number>>((result, item) => {
                result[item.stage] = (result[item.stage] || 0) + 1;
                return result;
              }, {}),
            )
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([stage, count]) => (
                <div className="barRow" key={stage}>
                  <span>{stageLabels[stage as keyof typeof stageLabels]}</span>
                  <div className="bar">
                    <span style={{ width: `${(count / applications.length) * 100}%` }} />
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
          </div>
        </section>
      </div>
    </>
  );
}
