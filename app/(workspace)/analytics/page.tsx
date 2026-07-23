import { calculateAnalytics } from "@/lib/analytics";
import { isNoResponseCandidate } from "@/lib/dates";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { activeStages, stageLabels } from "@/lib/stages";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [applications, settings] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id, archivedAt: null },
      include: {
        resumeVersion: { select: { name: true } },
        timeline: { select: { occurredAt: true, type: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
  ]);
  const analytics = calculateAnalytics(applications);
  const threshold = settings?.noResponseThresholdDays ?? 14;
  const noResponse = applications.filter((item) =>
    isNoResponseCandidate(
      item.appliedAt,
      item.stage,
      threshold,
      item.timeline.filter((event) => event.type !== "CREATED").length,
    ),
  ).length;
  const active = applications.filter((item) => activeStages.has(item.stage)).length;
  const maxStageCount = Math.max(1, ...Object.values(analytics.byStage));

  const months = applications.reduce<Record<string, number>>((result, item) => {
    const date = item.appliedAt || item.createdAt;
    const key = new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(date);
    result[key] = (result[key] || 0) + 1;
    return result;
  }, {});

  return (
    <>
      <div className="pageHeader">
        <div><h1>Analytics</h1><p>Signals to help you review your process, not predictions about outcomes.</p></div>
      </div>
      {!applications.length ? (
        <div className="emptyState"><div><h2>No analytics yet</h2><p>Add and update applications to build a useful view of your search.</p></div></div>
      ) : (
        <>
          <section className="summaryGrid" aria-label="Conversion summary">
            {[
              ["Response rate", `${analytics.responseRate}%`, `${analytics.submitted} submitted applications`],
              ["Interview rate", `${analytics.interviewRate}%`, "Reached an interview stage"],
              ["Offer rate", `${analytics.offerRate}%`, "Reached offer or accepted"],
              ["Average response", analytics.averageResponseDays === null ? "—" : `${analytics.averageResponseDays}d`, "Application to first recorded response"],
            ].map(([label, value, meta]) => (
              <article className="metricCard" key={label}>
                <span className="metricLabel">{label}</span>
                <strong className="metricValue">{value}</strong>
                <span className="metricMeta">{meta}</span>
              </article>
            ))}
          </section>
          <div className="notice" style={{ marginTop: "1rem" }}>
            A response means an application progressed beyond Applied or received a meaningful recorded interaction. Rates use submitted applications as the denominator.
          </div>
          <div className="dashboardGrid">
            <section className="panel">
              <div className="panelHeader"><h2>Applications by stage</h2><span className="subtle">Total {analytics.total}</span></div>
              <div className="barList" role="img" aria-label="Application counts by stage">
                {Object.entries(analytics.byStage).filter(([, count]) => count > 0).map(([stage, count]) => (
                  <div className="barRow" key={stage}>
                    <span>{stageLabels[stage as keyof typeof stageLabels]}</span>
                    <div className="bar"><span style={{ width: `${(count / maxStageCount) * 100}%` }} /></div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
            </section>
            <section className="panel">
              <h2>Pipeline health</h2>
              <dl className="detailFacts">
                <div className="fact"><dt>Active pipeline</dt><dd>{active}</dd></div>
                <div className="fact"><dt>No response after {threshold} days</dt><dd>{noResponse}</dd></div>
                <div className="fact"><dt>Rejection rate</dt><dd>{analytics.rejectionRate}%</dd></div>
                <div className="fact"><dt>Submitted</dt><dd>{analytics.submitted}</dd></div>
              </dl>
            </section>
            <section className="panel">
              <div className="panelHeader"><h2>Applications over time</h2><span className="subtle">By month</span></div>
              <table className="dataTable">
                <thead><tr><th>Month</th><th>Applications</th></tr></thead>
                <tbody>{Object.entries(months).map(([month, count]) => <tr key={month}><td>{month}</td><td>{count}</td></tr>)}</tbody>
              </table>
            </section>
            <section className="panel">
              <div className="panelHeader"><h2>Source performance</h2><span className="subtle">Descriptive only</span></div>
              <table className="dataTable">
                <thead><tr><th>Source</th><th>Applications</th><th>Responses</th></tr></thead>
                <tbody>{Object.entries(analytics.bySource).sort((a, b) => b[1].applications - a[1].applications).map(([source, values]) => <tr key={source}><td>{source}</td><td>{values.applications}</td><td>{values.responses}</td></tr>)}</tbody>
              </table>
            </section>
            <section className="panel">
              <div className="panelHeader"><h2>Work mode</h2><span className="subtle">All applications</span></div>
              <table className="dataTable">
                <thead><tr><th>Mode</th><th>Applications</th></tr></thead>
                <tbody>{Object.entries(analytics.byWorkMode).filter(([, count]) => count > 0).map(([mode, count]) => <tr key={mode}><td>{mode.toLowerCase()}</td><td>{count}</td></tr>)}</tbody>
              </table>
            </section>
            <section className="panel">
              <h2>How to use this view</h2>
              <p className="subtle">Look for process questions: Are follow-ups being recorded? Are certain sources producing conversations? Is the active pipeline large enough for your goals? Small samples can be misleading, and these metrics do not measure your worth or predict hiring outcomes.</p>
            </section>
          </div>
        </>
      )}
    </>
  );
}
